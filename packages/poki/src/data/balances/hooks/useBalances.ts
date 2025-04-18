import { WatchQueryFetchPolicy } from '@apollo/client'
import { usePortfolioBalances } from 'poki/src/features/dataApi/balances'
import { PortfolioBalance } from 'poki/src/features/dataApi/types'
import { CurrencyId } from 'poki/src/types/currency'
import { useMemo } from 'react'

export function useBalances({
  address,
  currencies,
  fetchPolicy = 'cache-and-network',
}: {
  address: Address
  currencies: CurrencyId[] | undefined
  fetchPolicy?: WatchQueryFetchPolicy
}): PortfolioBalance[] | null {
  const { data: balances } = usePortfolioBalances({
    address,
    fetchPolicy,
  })

  return useMemo(() => {
    if (!currencies || !currencies.length || !balances) {
      return null
    }

    return currencies.map((id: CurrencyId) => balances[id] ?? null).filter((x): x is PortfolioBalance => Boolean(x))
  }, [balances, currencies])
}
