import { filter } from 'poki/src/components/TokenSelector/filter'
import { usePortfolioBalancesForAddressById } from 'poki/src/components/TokenSelector/hooks/usePortfolioBalancesForAddressById'
import { TokenOption } from 'poki/src/components/TokenSelector/types'
import { GqlResult } from 'poki/src/data/types'
import { useEnabledChains } from 'poki/src/features/chains/hooks/useEnabledChains'
import { sortPortfolioBalances, useTokenBalancesGroupedByVisibility } from 'poki/src/features/dataApi/balances'
import { useMemo } from 'react'

export function usePortfolioTokenOptions(
  address: Address | undefined,
  searchFilter?: string,
): GqlResult<TokenOption[] | undefined> {
  const { data: portfolioBalancesById, error, refetch, loading } = usePortfolioBalancesForAddressById(address)
  const { isTestnetModeEnabled } = useEnabledChains()

  const { shownTokens } = useTokenBalancesGroupedByVisibility({
    balancesById: portfolioBalancesById,
  })

  const portfolioBalances = useMemo(
    () => (shownTokens ? sortPortfolioBalances({ balances: shownTokens, isTestnetModeEnabled }) : undefined),
    [shownTokens, isTestnetModeEnabled],
  )

  const filteredPortfolioBalances = useMemo(
    () => portfolioBalances && filter(portfolioBalances, searchFilter),
    [portfolioBalances, searchFilter],
  )

  return {
    data: filteredPortfolioBalances,
    error,
    refetch,
    loading,
  }
}
