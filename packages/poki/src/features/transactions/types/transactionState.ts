import { AssetType, TradeableAsset } from 'poki/src/entities/assets'
import { UniverseChainId } from 'poki/src/features/chains/types'
import { FiatOffRampMetaData } from 'poki/src/features/fiatOnRamp/types'
import { FrontendSupportedProtocol } from 'poki/src/features/transactions/swap/utils/protocols'
import { CurrencyField, CurrencyId } from 'poki/src/types/currency'
import { currencyIdToAddress, currencyIdToChain } from 'poki/src/utils/currencyId'

export interface TransactionState {
  txId?: string
  [CurrencyField.INPUT]: TradeableAsset | null
  [CurrencyField.OUTPUT]: TradeableAsset | null
  exactCurrencyField: CurrencyField
  exactAmountToken: string
  isMax?: boolean
  exactAmountFiat?: string
  focusOnCurrencyField?: CurrencyField | null
  skipFocusOnCurrencyField?: boolean
  recipient?: string
  isFiatInput?: boolean
  selectingCurrencyField?: CurrencyField
  selectingCurrencyChainId?: UniverseChainId
  showRecipientSelector?: boolean
  customSlippageTolerance?: number
  customDeadline?: number
  selectedProtocols?: FrontendSupportedProtocol[]
  fiatOffRampMetaData?: FiatOffRampMetaData
}

export const prepareSwapFormState = ({
  inputCurrencyId,
  outputCurrencyId,
  defaultChainId,
}: {
  inputCurrencyId?: CurrencyId
  outputCurrencyId?: CurrencyId
  defaultChainId: UniverseChainId
}): TransactionState => {
  return {
    exactCurrencyField: CurrencyField.INPUT,
    exactAmountToken: '',
    [CurrencyField.INPUT]: inputCurrencyId
      ? {
          address: currencyIdToAddress(inputCurrencyId),
          chainId: currencyIdToChain(inputCurrencyId) ?? defaultChainId,
          type: AssetType.Currency,
        }
      : null,
    [CurrencyField.OUTPUT]: outputCurrencyId
      ? {
          address: currencyIdToAddress(outputCurrencyId),
          chainId: currencyIdToChain(outputCurrencyId) ?? defaultChainId,
          type: AssetType.Currency,
        }
      : null,
  }
}
