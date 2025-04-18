import { createSelector, Selector } from '@reduxjs/toolkit'
import { PokiRootState } from 'poki/src/state'
import { unique } from 'utilities/src/primitives/array'

const selectFavoriteTokensWithPossibleDuplicates = (state: PokiRootState): string[] => state.favorites.tokens
export const selectFavoriteTokens = createSelector(selectFavoriteTokensWithPossibleDuplicates, unique)
export const selectHasFavoriteTokens = createSelector(selectFavoriteTokens, (tokens) => Boolean(tokens?.length > 0))

export const makeSelectHasTokenFavorited = (): Selector<PokiRootState, boolean, [string]> =>
  createSelector(
    selectFavoriteTokens,
    (_: PokiRootState, currencyId: string) => currencyId,
    (tokens, currencyId) => tokens?.includes(currencyId.toLowerCase()),
  )

const selectWatchedAddresses = (state: PokiRootState): string[] => state.favorites.watchedAddresses
export const selectWatchedAddressSet = createSelector(selectWatchedAddresses, (watched) => new Set(watched))

export const selectHasWatchedWallets = createSelector(selectWatchedAddresses, (watched) => Boolean(watched?.length > 0))
