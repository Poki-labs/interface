import { pokiBehaviorHistoryReducer } from 'poki/src/features/behaviorHistory/slice'
import { favoritesReducer } from 'poki/src/features/favorites/slice'
import { fiatOnRampAggregatorApi } from 'poki/src/features/fiatOnRamp/api'
import { notificationReducer } from 'poki/src/features/notifications/slice'
import { portfolioReducer } from 'poki/src/features/portfolio/slice/slice'
import { searchHistoryReducer } from 'poki/src/features/search/searchHistorySlice'
import { userSettingsReducer } from 'poki/src/features/settings/slice'
import { timingReducer } from 'poki/src/features/timing/slice'
import { tokensReducer } from 'poki/src/features/tokens/slice/slice'
import { transactionSettingsReducer } from 'poki/src/features/transactions/settings/slice'
import { transactionReducer } from 'poki/src/features/transactions/slice'
import { visibilityReducer } from 'poki/src/features/visibility/slice'
import { combineReducers } from 'redux'

export const pokiReducers = {
  [fiatOnRampAggregatorApi.reducerPath]: fiatOnRampAggregatorApi.reducer,
  favorites: favoritesReducer,
  notifications: notificationReducer,
  portfolio: portfolioReducer,
  searchHistory: searchHistoryReducer,
  timing: timingReducer,
  tokens: tokensReducer,
  transactions: transactionReducer,
  transactionSettings: transactionSettingsReducer,
  pokiBehaviorHistory: pokiBehaviorHistoryReducer,
  userSettings: userSettingsReducer,
  visibility: visibilityReducer,
} as const

// used to type RootState
export const pokiReducer = combineReducers(pokiReducers)

export const pokiPersistedStateList: Array<keyof typeof pokiReducers> = [
  'favorites',
  'portfolio',
  'searchHistory',
  'tokens',
  'transactions',
  'pokiBehaviorHistory',
  'userSettings',
  'visibility',
]

export type PokiState = ReturnType<typeof pokiReducer>
