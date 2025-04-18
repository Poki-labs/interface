import {
  TokenStandard,
  TokenTransfer,
  TransactionDirection,
} from 'poki/src/data/graphql/poki-data-api/__generated__/types-and-hooks'
import { fromGraphQLChain } from 'poki/src/features/chains/utils'
import { ACROSS_DAPP_INFO } from 'poki/src/features/transactions/swap/utils/routing'
import {
  BridgeTransactionInfo,
  TransactionDetailsType,
  TransactionListQueryResponse,
  TransactionType,
} from 'poki/src/features/transactions/types/transactionDetails'
import { buildCurrencyId, buildNativeCurrencyId } from 'poki/src/utils/currencyId'
import { deriveCurrencyAmountFromAssetResponse } from 'wallet/src/features/transactions/history/utils'

type AssetChanges = NonNullable<
  Extract<
    NonNullable<TransactionListQueryResponse>['details'],
    { __typename?: 'TransactionDetails' | undefined }
  >['assetChanges']
>

export default function parseBridgingTransaction(
  transaction: NonNullable<TransactionListQueryResponse>,
): BridgeTransactionInfo | undefined {
  if (transaction.details && transaction.details.__typename !== TransactionDetailsType.Transaction) {
    return undefined
  }

  const outTokenTransfer = findTokenTransfer(transaction.details.assetChanges, TransactionDirection.Out)
  const inTokenTransfer = findTokenTransfer(transaction.details.assetChanges, TransactionDirection.In)

  const outChainId = fromGraphQLChain(outTokenTransfer?.asset.chain)
  const inChainId = fromGraphQLChain(inTokenTransfer?.asset.chain)

  if (!outTokenTransfer || !outChainId || !inTokenTransfer || !inChainId) {
    return undefined
  }

  const outCurrencyId =
    outTokenTransfer.tokenStandard === TokenStandard.Native
      ? buildNativeCurrencyId(outChainId)
      : outTokenTransfer.asset.address
        ? buildCurrencyId(outChainId, outTokenTransfer.asset.address)
        : undefined

  const inCurrencyId =
    inTokenTransfer.tokenStandard === TokenStandard.Native
      ? buildNativeCurrencyId(inChainId)
      : inTokenTransfer.asset.address
        ? buildCurrencyId(inChainId, inTokenTransfer.asset.address)
        : undefined

  if (!outCurrencyId || !inCurrencyId) {
    return undefined
  }

  const outCurrencyAmountRaw = deriveCurrencyAmountFromAssetResponse(
    outTokenTransfer.tokenStandard,
    outTokenTransfer.asset.chain,
    outTokenTransfer.asset.address,
    outTokenTransfer.asset.decimals,
    outTokenTransfer.quantity,
  )

  const inCurrencyAmountRaw = deriveCurrencyAmountFromAssetResponse(
    inTokenTransfer.tokenStandard,
    inTokenTransfer.asset.chain,
    inTokenTransfer.asset.address,
    inTokenTransfer.asset.decimals,
    inTokenTransfer.quantity,
  )

  return {
    type: TransactionType.Bridge,
    inputCurrencyId: outCurrencyId,
    inputCurrencyAmountRaw: outCurrencyAmountRaw,
    outputCurrencyId: inCurrencyId,
    outputCurrencyAmountRaw: inCurrencyAmountRaw,
    routingDappInfo: ACROSS_DAPP_INFO,
  }
}

function findTokenTransfer(assetChanges: AssetChanges, direction: TransactionDirection): TokenTransfer | undefined {
  return assetChanges.find(
    (t): t is Extract<TokenTransfer, { __typename: 'TokenTransfer' }> =>
      t?.__typename === 'TokenTransfer' && t.direction === direction,
  )
}
