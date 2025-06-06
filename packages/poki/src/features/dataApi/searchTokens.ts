import { useSearchTokensQuery } from 'poki/src/data/graphql/poki-data-api/__generated__/types-and-hooks'
import { GqlResult } from 'poki/src/data/types'
import { useEnabledChains } from 'poki/src/features/chains/hooks/useEnabledChains'
import { UniverseChainId } from 'poki/src/features/chains/types'
import { toGraphQLChain } from 'poki/src/features/chains/utils'
import { CurrencyInfo } from 'poki/src/features/dataApi/types'
import { gqlTokenToCurrencyInfo, usePersistedError } from 'poki/src/features/dataApi/utils'
import { useCallback, useMemo } from 'react'

export function useSearchTokens(
  searchQuery: string | null,
  chainFilter: UniverseChainId | null,
  skip: boolean,
): GqlResult<CurrencyInfo[]> {
  const gqlChainFilter = chainFilter ? toGraphQLChain(chainFilter) : null
  const { gqlChains } = useEnabledChains()
  const { data, loading, error, refetch } = useSearchTokensQuery({
    variables: {
      searchQuery: searchQuery ?? '',
      chains: gqlChainFilter ? [gqlChainFilter] : gqlChains,
    },
    skip: skip || !searchQuery,
  })

  const persistedError = usePersistedError(loading, error)

  const formattedData = useMemo(() => {
    if (!data || !data.searchTokens) {
      return undefined
    }

    return data.searchTokens
      .map((token) => {
        if (!token) {
          return null
        }

        return gqlTokenToCurrencyInfo(token)
      })
      .filter((c): c is CurrencyInfo => Boolean(c))
  }, [data])

  const retry = useCallback(() => !skip && refetch({ searchQuery: searchQuery ?? '' }), [refetch, searchQuery, skip])

  return useMemo(
    () => ({ data: formattedData, loading, error: persistedError, refetch: retry }),
    [formattedData, loading, retry, persistedError],
  )
}
