import {
  TokenSortableField,
  useTopTokensQuery,
} from 'poki/src/data/graphql/poki-data-api/__generated__/types-and-hooks'
import { GqlResult } from 'poki/src/data/types'
import { UniverseChainId } from 'poki/src/features/chains/types'
import { isTestnetChain, toGraphQLChain } from 'poki/src/features/chains/utils'
import { CurrencyInfo } from 'poki/src/features/dataApi/types'
import { gqlTokenToCurrencyInfo, usePersistedError } from 'poki/src/features/dataApi/utils'
import { useMemo } from 'react'
import { useMemoCompare } from 'utilities/src/react/hooks'

export function usePopularTokensGql(chainFilter: UniverseChainId, disabled?: boolean): GqlResult<CurrencyInfo[]> {
  const gqlChainFilter = toGraphQLChain(chainFilter)
  const isTestnet = isTestnetChain(chainFilter)

  const { data, loading, error, refetch } = useTopTokensQuery({
    variables: {
      chain: gqlChainFilter,
      page: 1,
      pageSize: 100,
      orderBy: TokenSortableField.Popularity,
    },
    skip: isTestnet || disabled,
  })
  const persistedError = usePersistedError(loading, error)

  // TODO(API-482): we should be able to remove this once the backend bug is fixed.
  // There's currently a graphql backend bug where the top tokens query returns different data than the token query for some fields,
  // causing each query to override the results of the other query.
  // We partially fixed this with #12653, but there can still be other issues when the `topToken` query runs before `token`,
  // which then triggers an unnecessary re-render of the `useTopTokensQuery`.
  // Given that this hook doesn't care about `feeData` or `protectionInfo`, it's Ok to ignore those values
  // and use `useMemoCompare` with a custom comparator.
  const formattedData = useMemoCompare(
    () => {
      if (!data || !data.topTokens) {
        return undefined
      }

      return data.topTokens
        .map((token) => {
          if (!token) {
            return null
          }

          return gqlTokenToCurrencyInfo(token)
        })
        .filter((c): c is CurrencyInfo => Boolean(c))
    },
    (prevData, newData) => {
      if (prevData === newData) {
        return true
      }

      if (!prevData || prevData.length !== newData?.length) {
        return false
      }

      return prevData.every((prev, i) => {
        return prev.currencyId === newData?.[i]?.currencyId
      })
    },
  )

  return useMemo(
    () => ({ data: formattedData, loading, error: persistedError, refetch }),
    [formattedData, loading, persistedError, refetch],
  )
}
