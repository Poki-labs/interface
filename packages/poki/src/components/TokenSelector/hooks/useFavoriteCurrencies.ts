import { ApolloError } from '@apollo/client'
import { GqlResult } from 'poki/src/data/types'
import { useTokenProjects } from 'poki/src/features/dataApi/tokenProjects'
import { CurrencyInfo } from 'poki/src/features/dataApi/types'
import { usePersistedError } from 'poki/src/features/dataApi/utils'
import { selectFavoriteTokens } from 'poki/src/features/favorites/selectors'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'

export function useFavoriteCurrencies(): GqlResult<CurrencyInfo[]> {
  const favoriteCurrencyIds = useSelector(selectFavoriteTokens)
  const { data: favoriteTokensOnAllChains, loading, error, refetch } = useTokenProjects(favoriteCurrencyIds)

  const persistedError = usePersistedError(loading, error instanceof ApolloError ? error : undefined)

  // useTokenProjects returns each token on Arbitrum, Optimism, Polygon,
  // so we need to filter out the tokens which user has actually favorited
  const favoriteTokens = useMemo(
    () =>
      favoriteTokensOnAllChains &&
      favoriteCurrencyIds
        .map((_currencyId) => {
          return favoriteTokensOnAllChains.find((token) => token.currencyId === _currencyId)
        })
        .filter((token: CurrencyInfo | undefined): token is CurrencyInfo => {
          return !!token
        }),
    [favoriteCurrencyIds, favoriteTokensOnAllChains],
  )

  return { data: favoriteTokens, loading, error: persistedError, refetch }
}
