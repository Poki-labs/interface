import { QueryClient, useQueryClient } from '@tanstack/react-query'
import {
  TokenSelectorModal,
  TokenSelectorProps,
  TokenSelectorVariation,
} from 'poki/src/components/TokenSelector/TokenSelector'
import { TokenSelectorFlow } from 'poki/src/components/TokenSelector/types'
import { useAccountMeta, usePokiContext } from 'poki/src/contexts/PokiContext'
import { getSwappableTokensQueryData } from 'poki/src/data/apiClients/tradingApi/useTradingApiSwappableTokensQuery'
import { ChainId, GetSwappableTokensResponse } from 'poki/src/data/tradingApi/__generated__'
import { AssetType, TradeableAsset } from 'poki/src/entities/assets'
import { setHasSeenNetworkSelectorTooltip } from 'poki/src/features/behaviorHistory/slice'
import { useEnabledChains } from 'poki/src/features/chains/hooks/useEnabledChains'
import { UniverseChainId } from 'poki/src/features/chains/types'
import { useTokenProjects } from 'poki/src/features/dataApi/tokenProjects'
import { useTransactionModalContext } from 'poki/src/features/transactions/TransactionModal/TransactionModalContext'
import { SwapFormState, useSwapFormContext } from 'poki/src/features/transactions/swap/contexts/SwapFormContext'
import { getShouldResetExactAmountToken } from 'poki/src/features/transactions/swap/form/utils'
import { maybeLogFirstSwapAction } from 'poki/src/features/transactions/swap/utils/maybeLogFirstSwapAction'
import {
  getTokenAddressFromChainForTradingApi,
  toTradingApiSupportedChainId,
} from 'poki/src/features/transactions/swap/utils/tradingApi'
import { useUnichainTooltipVisibility } from 'poki/src/features/unichain/hooks/useUnichainTooltipVisibility'
import { Currency } from 'poki/src/sdk-core'
import { CurrencyField } from 'poki/src/types/currency'
import { areAddressesEqual } from 'poki/src/utils/addresses'
import { areCurrencyIdsEqual, currencyAddress, currencyId } from 'poki/src/utils/currencyId'
import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { useValueAsRef } from 'utilities/src/react/useValueAsRef'
import { useTrace } from 'utilities/src/telemetry/trace/TraceContext'

export function SwapTokenSelector({ isModalOpen }: { isModalOpen: boolean }): JSX.Element {
  const { onCurrencyChange } = useTransactionModalContext()
  const swapContext = useSwapFormContext()
  const dispatch = useDispatch()
  const { shouldShowUnichainNetworkSelectorTooltip } = useUnichainTooltipVisibility()

  const traceRef = useValueAsRef(useTrace())
  const swapContextRef = useValueAsRef(swapContext)

  const activeAccountAddress = useAccountMeta()?.address

  const { isTestnetModeEnabled, defaultChainId } = useEnabledChains()
  const { setIsSwapTokenSelectorOpen } = usePokiContext()

  const { updateSwapForm, selectingCurrencyField, output, input, filteredChainIds, isSelectingCurrencyFieldPrefilled } =
    swapContext

  if (isModalOpen && !selectingCurrencyField) {
    throw new Error('TokenSelector rendered without `selectingCurrencyField`')
  }

  const onHideTokenSelector = useCallback(() => {
    updateSwapForm({
      selectingCurrencyField: undefined,
      isSelectingCurrencyFieldPrefilled: false,
      // reset the filtered chain ids when coming back in from a prefill so it's not persisted forever
      ...(isSelectingCurrencyFieldPrefilled ? { filteredChainIds: {} } : {}),
    })
    setIsSwapTokenSelectorOpen(false) // resets force flag for web on close as cleanup

    // Ensure tooltip is hidden after closing network selector
    if (shouldShowUnichainNetworkSelectorTooltip) {
      dispatch(setHasSeenNetworkSelectorTooltip(true))
    }
  }, [
    dispatch,
    isSelectingCurrencyFieldPrefilled,
    setIsSwapTokenSelectorOpen,
    shouldShowUnichainNetworkSelectorTooltip,
    updateSwapForm,
  ])

  const inputTokenProjects = useTokenProjects(input ? [currencyId(input)] : [])
  const outputTokenProjects = useTokenProjects(output ? [currencyId(output)] : [])

  const queryClient = useQueryClient()

  const onSelectCurrency = useCallback(
    // eslint-disable-next-line complexity
    (currency: Currency, field: CurrencyField, forceIsBridgePair: boolean) => {
      const swapCtx = swapContextRef.current

      const tradeableAsset: TradeableAsset = {
        address: currencyAddress(currency),
        chainId: currency.chainId,
        type: AssetType.Currency,
      }

      const newState: Partial<SwapFormState> = {}

      const otherField = field === CurrencyField.INPUT ? CurrencyField.OUTPUT : CurrencyField.INPUT
      const otherFieldTradeableAsset = field === CurrencyField.INPUT ? swapCtx.output : swapCtx.input

      const otherFieldTokenProjects = otherField === CurrencyField.INPUT ? inputTokenProjects : outputTokenProjects

      const isBridgePair =
        // `forceIsBridgePair` means the user explicitly selected a bridge pair.
        forceIsBridgePair ||
        (tradeableAsset && otherFieldTradeableAsset
          ? checkIsBridgePair({
              queryClient,
              input: field === CurrencyField.INPUT ? tradeableAsset : otherFieldTradeableAsset,
              output: field === CurrencyField.OUTPUT ? tradeableAsset : otherFieldTradeableAsset,
            })
          : false)

      // swap order if tokens are the same
      if (otherFieldTradeableAsset && areCurrencyIdsEqual(currencyId(currency), currencyId(otherFieldTradeableAsset))) {
        const previouslySelectedTradableAsset = field === CurrencyField.INPUT ? swapCtx.input : swapCtx.output
        // Given that we're swapping the order of tokens, we should also swap the `exactCurrencyField` and update the `focusOnCurrencyField` to make sure the correct input field is focused.
        newState.exactCurrencyField =
          swapCtx.exactCurrencyField === CurrencyField.INPUT ? CurrencyField.OUTPUT : CurrencyField.INPUT
        newState.focusOnCurrencyField = newState.exactCurrencyField
        newState[otherField] = previouslySelectedTradableAsset
      } else if (otherFieldTradeableAsset && currency.chainId !== otherFieldTradeableAsset.chainId && !isBridgePair) {
        const otherCurrencyInNewChain = otherFieldTokenProjects?.data?.find(
          (project) => project?.currency.chainId === currency.chainId,
        )

        // if new token chain changes, try to find the other token's match on the new chain
        const otherTradeableAssetInNewChain: TradeableAsset | undefined = otherCurrencyInNewChain && {
          address: currencyAddress(otherCurrencyInNewChain.currency),
          chainId: otherCurrencyInNewChain.currency.chainId,
          type: AssetType.Currency,
        }

        newState[otherField] =
          otherTradeableAssetInNewChain &&
          otherCurrencyInNewChain &&
          !areCurrencyIdsEqual(currencyId(currency), otherCurrencyInNewChain.currencyId)
            ? otherTradeableAssetInNewChain
            : undefined
      }

      if (!isBridgePair) {
        // If selecting output, set the input and output chainIds
        // If selecting input and output is already selected, also set the input chainId
        if (field === CurrencyField.OUTPUT || !!swapCtx.output) {
          swapCtx.filteredChainIds[CurrencyField.INPUT] = currency.chainId
          swapCtx.filteredChainIds[CurrencyField.OUTPUT] = currency.chainId
          // If selecting input, only set the output chainId
        } else {
          swapCtx.filteredChainIds[CurrencyField.OUTPUT] = currency.chainId
        }

        newState.filteredChainIds = swapCtx.filteredChainIds
      }

      newState[field] = tradeableAsset

      if (getShouldResetExactAmountToken(swapCtx, newState)) {
        newState.exactAmountToken = ''
      }

      // TODO(WEB-6230): This value is not what we want here, as it breaks bridging in the interface's TDP.
      //                 Instead, what we want is the `Currency` object from `newState[otherField] || otherFieldTradeableAsset`.
      const todoFixMeOtherCurrency = otherFieldTokenProjects?.data?.find(
        (project) => project?.currency.chainId === currency.chainId,
      )

      const currencyState: { inputCurrency?: Currency; outputCurrency?: Currency } = {
        inputCurrency: CurrencyField.INPUT === field ? currency : todoFixMeOtherCurrency?.currency,
        outputCurrency: CurrencyField.OUTPUT === field ? currency : todoFixMeOtherCurrency?.currency,
      }

      onHideTokenSelector()
      updateSwapForm(newState)
      maybeLogFirstSwapAction(traceRef.current)
      onCurrencyChange?.(currencyState, isBridgePair)
    },
    // We want to be very careful about how often this function is re-created because it causes the entire token selector list to re-render.
    // This is why we use `swapContextRef` so that we can access the latest swap context without causing a re-render.
    // Do not add new dependencies to this function unless you are sure this won't degrade perf.
    [
      swapContextRef,
      inputTokenProjects,
      outputTokenProjects,
      queryClient,
      onHideTokenSelector,
      updateSwapForm,
      traceRef,
      onCurrencyChange,
    ],
  )

  const getChainId = (): UniverseChainId | undefined => {
    const selectedChainId = filteredChainIds[selectingCurrencyField ?? CurrencyField.INPUT]

    // allow undefined for prod networks
    if (selectedChainId || !isTestnetModeEnabled) {
      return selectedChainId
    }

    // should never be undefined for testnets
    return filteredChainIds[CurrencyField.INPUT] ?? input?.chainId ?? defaultChainId
  }

  const props: TokenSelectorProps = {
    isModalOpen,
    activeAccountAddress,
    chainId: getChainId(),
    input,
    // token selector modal will only open on currency field selection; casting to satisfy typecheck here - we should consider refactoring the types here to avoid casting
    currencyField: selectingCurrencyField as CurrencyField,
    flow: TokenSelectorFlow.Swap,
    variation:
      selectingCurrencyField === CurrencyField.INPUT
        ? TokenSelectorVariation.SwapInput
        : TokenSelectorVariation.SwapOutput,
    onClose: onHideTokenSelector,
    onSelectCurrency,
  }
  return <TokenSelectorModal {...props} />
}

/**
 * Checks if the newly selected input/output token is bridgeable.
 * We want this to be a synchronous check, so it assumes we've called `usePrefetchSwappableTokens` for whichever token had been selected first.
 */
function checkIsBridgePair({
  queryClient,
  input,
  output,
}: {
  queryClient: QueryClient
  input: TradeableAsset
  output: TradeableAsset
}): boolean {
  if (input.chainId === output.chainId) {
    return false
  }

  const tokenIn = getTokenAddressFromChainForTradingApi(input.address, input.chainId)
  const tokenInChainId = toTradingApiSupportedChainId(input.chainId)
  const tokenOut = getTokenAddressFromChainForTradingApi(output.address, output.chainId)
  const tokenOutChainId = toTradingApiSupportedChainId(output.chainId)

  if (!tokenIn || !tokenInChainId || !tokenOut || !tokenOutChainId) {
    return false
  }

  // We assume that if you can swap A for B, then you can also swap B for A,
  // so we check both directions and return true if we have data for either direction.
  // We can guarantee that one of the 2 directions will already be cached (whichever token was selected first).

  const inputBridgePairs = getSwappableTokensQueryData({
    params: { tokenIn, tokenInChainId },
    queryClient,
  })

  const outputBridgePairs = getSwappableTokensQueryData({
    params: { tokenIn: tokenOut, tokenInChainId: tokenOutChainId },
    queryClient,
  })

  const inputHasMatchingBridgeToken =
    !!inputBridgePairs &&
    hasMatchingBridgeToken({
      bridgePairs: inputBridgePairs,
      tokenAddress: tokenOut,
      tokenChainId: tokenOutChainId,
    })

  const outputHasMatchingBridgeToken =
    !!outputBridgePairs &&
    hasMatchingBridgeToken({
      bridgePairs: outputBridgePairs,
      tokenAddress: tokenIn,
      tokenChainId: tokenInChainId,
    })

  return inputHasMatchingBridgeToken || outputHasMatchingBridgeToken
}

function hasMatchingBridgeToken({
  bridgePairs,
  tokenAddress,
  tokenChainId,
}: {
  bridgePairs: GetSwappableTokensResponse
  tokenAddress: Address
  tokenChainId: ChainId
}): boolean {
  return !!bridgePairs.tokens.find(
    (token) => areAddressesEqual(token.address, tokenAddress) && token.chainId === tokenChainId,
  )
}
