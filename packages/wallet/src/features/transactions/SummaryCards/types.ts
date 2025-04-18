import { AuthTrigger } from 'poki/src/features/auth/types'
import { UniverseChainId } from 'poki/src/features/chains/types'
import { TransactionDetails } from 'poki/src/features/transactions/types/transactionDetails'
import { TransactionState } from 'poki/src/features/transactions/types/transactionState'
import { IcExplorerAddressTransaction } from 'poki/src/types/ic-explorer'

export interface TransactionSummaryLayoutProps {
  // authTrigger?: AuthTrigger
  transaction: IcExplorerAddressTransaction
  address: string
  // title?: string
  // caption: string | JSX.Element
  // icon?: JSX.Element
  // index?: number
  // onRetry?: () => void
}

export interface SummaryItemProps {
  authTrigger?: AuthTrigger
  transaction: IcExplorerAddressTransaction
  swapCallbacks?: SwapSummaryCallbacks
  index?: number
}

export interface SwapSummaryCallbacks {
  useLatestSwapTransaction: (address: string) => TransactionDetails | undefined
  useSwapFormTransactionState: (
    address: Address | undefined,
    chainId: UniverseChainId | undefined,
    txId: string | undefined,
  ) => TransactionState | undefined
  onRetryGenerator?: (swapFormState: TransactionState | undefined) => () => void
}
