import { GQLQueries } from 'poki/src/data/graphql/poki-data-api/queries'

export const GQL_QUERIES_TO_REFETCH_ON_TXN_UPDATE = [
  GQLQueries.PortfolioBalances,
  GQLQueries.TransactionList,
  GQLQueries.NftsTab,
]
