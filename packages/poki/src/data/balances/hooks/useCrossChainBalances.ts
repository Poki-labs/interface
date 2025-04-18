import { WatchQueryFetchPolicy } from '@apollo/client'
import { useBalances } from 'poki/src/data/balances/hooks/useBalances'
import { Chain } from 'poki/src/data/graphql/poki-data-api/__generated__/types-and-hooks'
import { fromGraphQLChain } from 'poki/src/features/chains/utils'
import { PortfolioBalance } from 'poki/src/features/dataApi/types'
import { buildCurrencyId, buildNativeCurrencyId, currencyIdToChain } from 'poki/src/utils/currencyId'
import { useMemo } from 'react'

export function useCrossChainBalances({
  address,
  currencyId,
  crossChainTokens,
  fetchPolicy = 'cache-and-network',
}: {
  address: Address
  currencyId: string
  crossChainTokens: Maybe<{ chain: Chain; address?: Maybe<string> }[]>
  fetchPolicy?: WatchQueryFetchPolicy
}): {
  currentChainBalance: PortfolioBalance | null
  otherChainBalances: PortfolioBalance[] | null
} {
  const currentChainBalance =
    useBalances({
      address,
      currencies: [currencyId],
      fetchPolicy,
    })?.[0] ?? null

  const currentChainId = currencyIdToChain(currencyId)

  const bridgedCurrencyIds = useMemo(
    () =>
      crossChainTokens
        ?.map(({ chain, address: currencyAddress }) => {
          const chainId = fromGraphQLChain(chain)
          if (!chainId || chainId === currentChainId) {
            return null
          }
          if (!currencyAddress) {
            return buildNativeCurrencyId(chainId)
          }
          return buildCurrencyId(chainId, currencyAddress)
        })
        .filter((b): b is string => !!b),

    [crossChainTokens, currentChainId],
  )

  const otherChainBalances = useBalances({ address, currencies: bridgedCurrencyIds })

  return {
    currentChainBalance,
    otherChainBalances,
  }
}
