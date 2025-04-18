import { useTokenProjectsQuery } from 'poki/src/data/graphql/poki-data-api/__generated__/types-and-hooks'
import { GqlResult } from 'poki/src/data/types'
import { CurrencyInfo } from 'poki/src/features/dataApi/types'
import { currencyIdToContractInput, tokenProjectToCurrencyInfos } from 'poki/src/features/dataApi/utils'
import { CurrencyId } from 'poki/src/types/currency'
import { useCallback, useMemo } from 'react'

/**
 * Fetches token information as CurrencyInfo from currencyIds. When used, wrap component
 * with Suspense.
 */
export function useTokenProjects(currencyIds: CurrencyId[]): GqlResult<CurrencyInfo[]> {
  const contracts = useMemo(() => currencyIds.map((id) => currencyIdToContractInput(id)), [currencyIds])

  const { data, loading, error, refetch } = useTokenProjectsQuery({
    variables: { contracts },
  })

  const formattedData = useMemo(() => {
    if (!data || !data.tokenProjects) {
      return undefined
    }

    return tokenProjectToCurrencyInfos(data.tokenProjects)
  }, [data])

  const retry = useCallback(() => refetch({ contracts }), [contracts, refetch])

  return { data: formattedData, loading, refetch: retry, error }
}
