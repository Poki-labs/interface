import { AccountMeta } from 'poki/src/features/accounts/types'
import { ValidatedTransactionRequest } from 'poki/src/features/transactions/swap/utils/trade'
import { GasFeeEstimates } from 'poki/src/features/transactions/types/transactionDetails'
import { WrapType } from 'poki/src/features/transactions/types/wrap'
import { Currency, CurrencyAmount } from 'poki/src/sdk-core'

export type WrapCallbackParams = {
  account: AccountMeta
  inputCurrencyAmount: CurrencyAmount<Currency>
  wrapType: WrapType.Wrap | WrapType.Unwrap
  onSuccess: () => void
  onFailure: () => void
  txRequest: ValidatedTransactionRequest
  txId?: string
  gasEstimates?: GasFeeEstimates
}

export type WrapCallback = (params: WrapCallbackParams) => void
