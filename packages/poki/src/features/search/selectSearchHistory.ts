import { SearchResult } from 'poki/src/features/search/SearchResult'
import { PokiState } from 'poki/src/state/pokiReducer'

export const selectSearchHistory = (state: PokiState): SearchResult[] => {
  return state.searchHistory.results
}
