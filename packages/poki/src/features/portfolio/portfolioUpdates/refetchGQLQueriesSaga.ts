import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { isInstantTokenBalanceUpdateEnabled } from 'poki/src/features/portfolio/portfolioUpdates/isInstantTokenBalanceUpdateEnabled'
import { refetchGQLQueriesViaBackendPollVariant } from 'poki/src/features/portfolio/portfolioUpdates/refetchGQLQueriesViaBackendPollVariantSaga'
import { refetchGQLQueriesViaOnchainOverrideVariant } from 'poki/src/features/portfolio/portfolioUpdates/refetchGQLQueriesViaOnchainOverrideVariantSaga'

import { TransactionDetails } from 'poki/src/features/transactions/types/transactionDetails'

export function* refetchGQLQueries({
  transaction,
  apolloClient,
  activeAddress,
}: {
  transaction: TransactionDetails
  apolloClient: ApolloClient<NormalizedCacheObject>
  activeAddress: string | null
}) {
  if (isInstantTokenBalanceUpdateEnabled()) {
    yield* refetchGQLQueriesViaOnchainOverrideVariant({ transaction, apolloClient, activeAddress })
  } else {
    yield* refetchGQLQueriesViaBackendPollVariant({ transaction, apolloClient, activeAddress })
  }
}
