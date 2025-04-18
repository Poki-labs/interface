import { ReactNode, createContext, useCallback, useContext, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AssetType } from 'poki/src/entities/assets'
import { useEnabledChains } from 'poki/src/features/chains/hooks/useEnabledChains'
import { UniverseChainId } from 'poki/src/features/chains/types'
import { useMaxAmountSpend } from 'poki/src/features/gas/useMaxAmountSpend'
import { TransactionType } from 'poki/src/features/transactions/types/transactionDetails'
import { TransactionState } from 'poki/src/features/transactions/types/transactionState'
import { CurrencyField } from 'poki/src/types/currency'
import { IcExplorerTokenDetail } from 'poki/src/types/ic-explorer'
import { useDerivedSendInfo } from 'wallet/src/features/transactions/send/hooks/useDerivedSendInfo'
import { useActiveAccountWithThrow } from 'wallet/src/features/wallet/hooks'

export const getDefaultSendState = (defaultChainId: UniverseChainId): Readonly<TransactionState> => ({
  [CurrencyField.INPUT]: {
    address: 'ryjl3-tyaaa-aaaaa-aaaba-cai',
    chainId: defaultChainId,
    type: AssetType.Currency,
  },
  [CurrencyField.OUTPUT]: null,
  exactCurrencyField: CurrencyField.INPUT,
  focusOnCurrencyField: CurrencyField.INPUT,
  exactAmountToken: '',
  exactAmountFiat: '',
  isFiatInput: false,
  selectingCurrencyField: undefined,
  showRecipientSelector: true,
  customSlippageTolerance: undefined,
  isMax: false,
})

type SendContextState = {
  derivedSendInfo: ReturnType<typeof useDerivedSendInfo>
  onSelectCurrency: (currency: IcExplorerTokenDetail, _currencyField: CurrencyField, _isBridgePair: boolean) => void
  updateSendForm: (newState: Partial<TransactionState>) => void
} & TransactionState

export const SendContext = createContext<SendContextState | undefined>(undefined)

export function SendContextProvider({
  prefilledTransactionState,
  children,
}: {
  prefilledTransactionState?: TransactionState
  children: ReactNode
}): JSX.Element {
  const { t } = useTranslation()
  const account = useActiveAccountWithThrow()
  const { defaultChainId } = useEnabledChains()
  const defaultSendState = getDefaultSendState(defaultChainId)

  // state
  const [sendForm, setSendForm] = useState<TransactionState>(prefilledTransactionState || defaultSendState)

  // derived info based on transfer state
  const derivedSendInfo = useDerivedSendInfo(sendForm)
  const maxInputAmount = useMaxAmountSpend({
    currencyAmount: derivedSendInfo.currencyBalances[CurrencyField.INPUT],
    txType: TransactionType.Send,
    isExtraTx: true,
  })?.toExact()

  const updateSendForm = useCallback(
    (passedNewState: Parameters<SendContextState['updateSendForm']>[0]): void => {
      const newState = { ...passedNewState }
      const isAmountSet = (newState.isFiatInput ? newState.exactAmountFiat : newState.exactAmountToken) !== undefined

      if (isAmountSet) {
        // for explicit "max" actions (eg max button clicked)
        const isExplicitMax = !!newState.isMax

        const isMaxTokenAmount =
          maxInputAmount && newState.exactAmountToken
            ? parseFloat(maxInputAmount) <= parseFloat(newState.exactAmountToken)
            : isExplicitMax

        newState.isMax = isMaxTokenAmount
      }

      setSendForm((prevState) => ({ ...prevState, ...newState }))
    },
    [setSendForm, maxInputAmount],
  )

  // const warnings = useSendWarnings(t, derivedSendInfo)
  // const txRequest = useSendTransactionRequest(derivedSendInfo)
  // const gasFee = useTransactionGasFee(
  //   txRequest,
  //   warnings.some((warning) => warning.action === WarningAction.DisableReview),
  // )
  // const txRequestWithGasSettings = useMemo(
  //   (): providers.TransactionRequest => ({ ...txRequest, ...gasFee.params }),
  //   [gasFee.params, txRequest],
  // )
  // const gasWarning = useTransactionGasWarning({
  //   account,
  //   derivedInfo: derivedSendInfo,
  //   gasFee: gasFee.value,
  // })
  // const allSendWarnings = useMemo(() => {
  //   return !gasWarning ? warnings : [...warnings, gasWarning]
  // }, [warnings, gasWarning])
  // const parsedSendWarnings = useFormattedWarnings(allSendWarnings)

  // helper function for currency selection
  const onSelectCurrency = useCallback(
    (currency: IcExplorerTokenDetail, _currencyField: CurrencyField, _isBridgePair: boolean) => {
      updateSendForm({
        [CurrencyField.INPUT]: {
          address: currency.ledgerId,
          chainId: defaultChainId,
          type: AssetType.Currency,
        },
        selectingCurrencyField: undefined,
      })
    },
    [updateSendForm],
  )

  const state: SendContextState = useMemo(() => {
    return {
      derivedSendInfo,
      onSelectCurrency,
      updateSendForm,
      txId: sendForm.txId,
      [CurrencyField.INPUT]: sendForm.input,
      [CurrencyField.OUTPUT]: sendForm.output,
      exactAmountToken: sendForm.exactAmountToken,
      exactAmountFiat: sendForm.exactAmountFiat,
      exactCurrencyField: sendForm.exactCurrencyField,
      focusOnCurrencyField: sendForm.focusOnCurrencyField,
      isMax: sendForm.isMax,
      recipient: sendForm.recipient,
      isFiatInput: sendForm.isFiatInput,
      selectingCurrencyField: sendForm.selectingCurrencyField,
      showRecipientSelector: sendForm.showRecipientSelector,
      selectedProtocols: sendForm.selectedProtocols,
      customSlippageTolerance: sendForm.customSlippageTolerance,
      fiatOffRampMetaData: sendForm.fiatOffRampMetaData,
    }
  }, [
    derivedSendInfo,
    // gasFee,
    // parsedSendWarnings,
    // txRequestWithGasSettings,
    onSelectCurrency,
    updateSendForm,
    sendForm.txId,
    sendForm.input,
    sendForm.output,
    sendForm.exactAmountToken,
    sendForm.exactAmountFiat,
    sendForm.exactCurrencyField,
    sendForm.focusOnCurrencyField,
    sendForm.recipient,
    sendForm.isFiatInput,
    sendForm.isMax,
    sendForm.selectingCurrencyField,
    sendForm.showRecipientSelector,
    sendForm.customSlippageTolerance,
    sendForm.selectedProtocols,
    sendForm.fiatOffRampMetaData,
  ])
  return <SendContext.Provider value={state}>{children}</SendContext.Provider>
}

export const useSendContext = (): SendContextState => {
  const sendContext = useContext(SendContext)

  if (sendContext === undefined) {
    throw new Error('`useSendContext` must be used inside of `SendContextProvider`')
  }

  return sendContext
}
