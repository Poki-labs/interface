import { filter } from 'poki/src/components/TokenSelector/filter'
import { usePortfolioBalancesForAddressById } from 'poki/src/components/TokenSelector/hooks/usePortfolioBalancesForAddressById'
import { TokenOption } from 'poki/src/components/TokenSelector/types'
import { createEmptyTokenOptionFromBridgingToken } from 'poki/src/components/TokenSelector/utils'
import { useTradingApiSwappableTokensQuery } from 'poki/src/data/apiClients/tradingApi/useTradingApiSwappableTokensQuery'
import { tradingApiSwappableTokenToCurrencyInfo } from 'poki/src/data/apiClients/tradingApi/utils/tradingApiSwappableTokenToCurrencyInfo'
import { useCrossChainBalances } from 'poki/src/data/balances/hooks/useCrossChainBalances'
import { useTokenProjectsQuery } from 'poki/src/data/graphql/poki-data-api/__generated__/types-and-hooks'
import { GetSwappableTokensResponse } from 'poki/src/data/tradingApi/__generated__'
import { GqlResult } from 'poki/src/data/types'
import { TradeableAsset } from 'poki/src/entities/assets'
import { ALL_CHAIN_IDS, UniverseChainId } from 'poki/src/features/chains/types'
import { toSupportedChainId } from 'poki/src/features/chains/utils'
import { CurrencyInfo, PortfolioBalance } from 'poki/src/features/dataApi/types'
import { currencyIdToContractInput } from 'poki/src/features/dataApi/utils'
import { FeatureFlags } from 'poki/src/features/gating/flags'
import { useFeatureFlag } from 'poki/src/features/gating/hooks'
import {
  NATIVE_ADDRESS_FOR_TRADING_API,
  getTokenAddressFromChainForTradingApi,
  toTradingApiSupportedChainId,
} from 'poki/src/features/transactions/swap/utils/tradingApi'
import { buildCurrencyId, buildNativeCurrencyId } from 'poki/src/utils/currencyId'
import { useCallback, useMemo } from 'react'
import { logger } from 'utilities/src/logger/logger'

export function useBridgingTokenWithHighestBalance({
  address,
  currencyAddress,
  currencyChainId,
}: {
  address: Address
  currencyAddress: Address
  currencyChainId: UniverseChainId
}):
  | {
      token: GetSwappableTokensResponse['tokens'][number]
      balance: PortfolioBalance
      currencyInfo: CurrencyInfo
    }
  | undefined {
  const currencyId = buildCurrencyId(currencyChainId, currencyAddress)
  const tokenIn = currencyAddress ? getTokenAddressFromChainForTradingApi(currencyAddress, currencyChainId) : undefined
  const tokenInChainId = toTradingApiSupportedChainId(currencyChainId)

  const { data: tokenProjectsData } = useTokenProjectsQuery({
    variables: { contracts: [currencyIdToContractInput(currencyId)] },
  })

  const crossChainTokens = tokenProjectsData?.tokenProjects?.[0]?.tokens

  const { otherChainBalances } = useCrossChainBalances({
    address,
    currencyId,
    crossChainTokens,
    fetchPolicy: 'cache-first',
  })

  const unichainEnabled = useFeatureFlag(FeatureFlags.Unichain)
  const { data: bridgingTokens } = useTradingApiSwappableTokensQuery({
    params:
      otherChainBalances && otherChainBalances?.length > 0 && tokenIn && tokenInChainId
        ? {
            tokenIn,
            tokenInChainId,
            unichainEnabled,
          }
        : undefined,
  })

  return useMemo(() => {
    if (!otherChainBalances || !bridgingTokens?.tokens) {
      return undefined
    }

    const tokenWithHighestBalance = bridgingTokens.tokens.reduce<
      ReturnType<typeof useBridgingTokenWithHighestBalance> | undefined
    >((currentHighest, token) => {
      const balance = otherChainBalances.find((b) => b.currencyInfo.currency.chainId === token.chainId)

      if (!balance?.balanceUSD) {
        return currentHighest
      }

      if (
        !currentHighest ||
        !currentHighest.balance.balanceUSD ||
        balance.balanceUSD > currentHighest.balance.balanceUSD
      ) {
        const currencyInfo = tradingApiSwappableTokenToCurrencyInfo(token)

        if (!currencyInfo) {
          logger.error(new Error('Failed to convert swappable token to currency info'), {
            tags: { file: 'bridging/hooks/tokens.ts', function: 'useBridgingTokenWithHighestBalance' },
            extra: { token },
          })
          return currentHighest
        }

        return {
          token,
          balance,
          currencyInfo,
        }
      }

      return currentHighest
    }, undefined)

    return tokenWithHighestBalance
  }, [otherChainBalances, bridgingTokens])
}

export function useBridgingTokensOptions({
  input,
  walletAddress,
  chainFilter,
}: {
  input: TradeableAsset | undefined
  walletAddress: Address | undefined
  chainFilter: UniverseChainId | null
}): GqlResult<TokenOption[] | undefined> & { shouldNest?: boolean } {
  const tokenIn = input?.address ? getTokenAddressFromChainForTradingApi(input.address, input.chainId) : undefined
  const tokenInChainId = toTradingApiSupportedChainId(input?.chainId)
  const unichainEnabled = useFeatureFlag(FeatureFlags.Unichain)
  const {
    data: bridgingTokens,
    isLoading: loadingBridgingTokens,
    error: errorBridgingTokens,
    refetch: refetchBridgingTokens,
  } = useTradingApiSwappableTokensQuery({
    params:
      tokenIn && tokenInChainId
        ? {
            tokenIn,
            tokenInChainId,
            unichainEnabled,
          }
        : undefined,
  })

  // Get portfolio balance for returned tokens
  const {
    data: portfolioBalancesById,
    error: portfolioBalancesByIdError,
    refetch: portfolioBalancesByIdRefetch,
    loading: loadingPorfolioBalancesById,
  } = usePortfolioBalancesForAddressById(walletAddress)

  const tokenOptions = useBridgingTokensToTokenOptions(bridgingTokens?.tokens, portfolioBalancesById)
  // Filter out tokens that are not on the current chain, unless the input token is the same as the current chain
  const isSameChain = input?.chainId === chainFilter
  const shouldFilterByChain = chainFilter !== null && !isSameChain
  const filteredTokenOptions = useMemo(
    () => filter(tokenOptions ?? null, shouldFilterByChain ? chainFilter : null),
    [tokenOptions, shouldFilterByChain, chainFilter],
  )

  const error = (!portfolioBalancesById && portfolioBalancesByIdError) || (!tokenOptions && errorBridgingTokens)

  const refetch = useCallback(async () => {
    portfolioBalancesByIdRefetch?.()
    await refetchBridgingTokens?.()
  }, [portfolioBalancesByIdRefetch, refetchBridgingTokens])

  return {
    data: filteredTokenOptions,
    loading: loadingBridgingTokens || loadingPorfolioBalancesById,
    error: error || undefined,
    refetch,
    shouldNest: !shouldFilterByChain,
  }
}

function useBridgingTokensToTokenOptions(
  bridgingTokens: GetSwappableTokensResponse['tokens'] | undefined,
  portfolioBalancesById?: Record<string, PortfolioBalance>,
): TokenOption[] | undefined {
  return useMemo(() => {
    if (!bridgingTokens) {
      return undefined
    }

    // We sort the tokens by chain in the same order chains in the network selector
    const chainOrder = ALL_CHAIN_IDS
    const sortedBridgingTokens = [...bridgingTokens].sort((a, b) => {
      if (!a || !b) {
        return 0
      }
      const chainIdA = toSupportedChainId(a.chainId)
      const chainIdB = toSupportedChainId(b.chainId)
      if (!chainIdA || !chainIdB) {
        return 0
      }
      return chainOrder.indexOf(chainIdA) - chainOrder.indexOf(chainIdB)
    })

    return sortedBridgingTokens
      .map((token) => {
        const chainId = toSupportedChainId(token.chainId)
        const validInput = token.address && token.chainId
        if (!chainId || !validInput) {
          return undefined
        }

        const isNative = token.address === NATIVE_ADDRESS_FOR_TRADING_API
        const currencyId = isNative ? buildNativeCurrencyId(chainId) : buildCurrencyId(chainId, token.address)
        return portfolioBalancesById?.[currencyId.toLowerCase()] ?? createEmptyTokenOptionFromBridgingToken(token)
      })
      .filter((tokenOption): tokenOption is TokenOption => tokenOption !== undefined)
  }, [bridgingTokens, portfolioBalancesById])
}
