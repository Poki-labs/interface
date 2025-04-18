import { SignerMnemonicAccountMeta } from 'poki/src/features/accounts/types'
import { TransactionStep } from 'poki/src/features/transactions/swap/types/steps'
import { ValidatedSwapTxContext } from 'poki/src/features/transactions/swap/types/swapTxAndGasInfo'
import { Currency, CurrencyAmount } from 'poki/src/sdk-core'

export type SetCurrentStepFn = (args: { step: TransactionStep; accepted: boolean }) => void

export interface SwapCallbackParams {
  account: SignerMnemonicAccountMeta
  swapTxContext: ValidatedSwapTxContext
  currencyInAmountUSD: Maybe<CurrencyAmount<Currency>>
  currencyOutAmountUSD: Maybe<CurrencyAmount<Currency>>
  isAutoSlippage: boolean
  onSuccess: () => void
  onFailure: (error?: Error) => void
  txId?: string
  setCurrentStep: SetCurrentStepFn
  setSteps: (steps: TransactionStep[]) => void
  isFiatInputMode?: boolean
}

export type SwapCallback = (params: SwapCallbackParams) => void
