import {
  SwapOrderStatus,
  SwapOrderType,
  TokenStandard,
} from 'poki/src/data/graphql/poki-data-api/__generated__/types-and-hooks'
import { Routing } from 'poki/src/data/tradingApi/__generated__/index'
import { UniverseChainId } from 'poki/src/features/chains/types'
import { fromGraphQLChain } from 'poki/src/features/chains/utils'
import {
  ConfirmedSwapTransactionInfo,
  TransactionDetails,
  TransactionDetailsType,
  TransactionListQueryResponse,
  TransactionOriginType,
  TransactionStatus,
  TransactionType,
} from 'poki/src/features/transactions/types/transactionDetails'
import { buildCurrencyId } from 'poki/src/utils/currencyId'
import { deriveCurrencyAmountFromAssetResponse } from 'wallet/src/features/transactions/history/utils'

export function extractPokiXOrderDetails(transaction: TransactionListQueryResponse): TransactionDetails | null {
  if (transaction?.details.__typename !== TransactionDetailsType.PokiXOrder) {
    return null
  }

  const typeInfo = parsePokiXOrderTransaction(transaction)
  const routing = transaction.details.swapOrderType === SwapOrderType.Limit ? Routing.DUTCH_LIMIT : Routing.DUTCH_V2

  // TODO (MOB-3609): Parse and show pending limit orders in Activity feed
  if (!typeInfo || transaction.details.swapOrderType === SwapOrderType.Limit) {
    return null
  }

  return {
    routing,
    id: transaction.details.id,
    // TODO: WALL-4919: Remove hardcoded Mainnet
    chainId: fromGraphQLChain(transaction.chain) ?? UniverseChainId.Mainnet,
    addedTime: transaction.timestamp * 1000, // convert to ms,
    status: remoteOrderStatusToLocalTxStatus(transaction.details.orderStatus),
    from: transaction.details.offerer, // This transaction is not on-chain, so use the offerer address as the from address
    orderHash: transaction.details.hash,
    typeInfo,
    transactionOriginType: TransactionOriginType.Internal,
  }
}

// eslint-disable-next-line consistent-return
function remoteOrderStatusToLocalTxStatus(orderStatus: SwapOrderStatus): TransactionStatus {
  switch (orderStatus) {
    case SwapOrderStatus.Open:
      return TransactionStatus.Pending
    case SwapOrderStatus.Expired:
      return TransactionStatus.Expired
    case SwapOrderStatus.Error:
      return TransactionStatus.Failed
    case SwapOrderStatus.InsufficientFunds:
      return TransactionStatus.InsufficientFunds
    case SwapOrderStatus.Filled:
      return TransactionStatus.Success
    case SwapOrderStatus.Cancelled:
      return TransactionStatus.Canceled
  }
}

export default function parsePokiXOrderTransaction(
  transaction: NonNullable<TransactionListQueryResponse>,
): ConfirmedSwapTransactionInfo | null {
  if (transaction?.details?.__typename !== TransactionDetailsType.PokiXOrder) {
    return null
  }

  const chainId = fromGraphQLChain(transaction.chain)
  if (!chainId) {
    return null
  }

  // Token swap
  const inputCurrencyId = transaction.details.inputToken.address
    ? buildCurrencyId(chainId, transaction.details.inputToken.address)
    : null
  const outputCurrencyId = transaction.details.outputToken.address
    ? buildCurrencyId(chainId, transaction.details.outputToken.address)
    : null

  const inputCurrencyAmountRaw = deriveCurrencyAmountFromAssetResponse(
    TokenStandard.Erc20,
    transaction.chain,
    transaction.details.inputToken.address,
    transaction.details.inputToken.decimals,
    transaction.details.inputTokenQuantity,
  )

  const outputCurrencyAmountRaw = deriveCurrencyAmountFromAssetResponse(
    TokenStandard.Erc20,
    transaction.chain,
    transaction.details.outputToken.address,
    transaction.details.outputToken.decimals,
    transaction.details.outputTokenQuantity,
  )

  if (!inputCurrencyId || !outputCurrencyId) {
    return null
  }

  return {
    type: TransactionType.Swap,
    inputCurrencyId,
    outputCurrencyId,
    inputCurrencyAmountRaw,
    outputCurrencyAmountRaw,
  }
}
