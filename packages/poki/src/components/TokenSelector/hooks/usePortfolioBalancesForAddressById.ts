import { GqlResult } from 'poki/src/data/types'
import { usePortfolioBalances } from 'poki/src/features/dataApi/balances'
import { PortfolioBalance } from 'poki/src/features/dataApi/types'

export function usePortfolioBalancesForAddressById(
  address: Address | undefined,
): GqlResult<Record<Address, PortfolioBalance> | undefined> {
  const {
    data: portfolioBalancesById,
    error,
    refetch,
    loading,
  } = usePortfolioBalances({
    address,
    fetchPolicy: 'cache-first', // we want to avoid re-renders when token selector is opening
  })

  return {
    data: portfolioBalancesById,
    error,
    refetch,
    loading,
  }
}
