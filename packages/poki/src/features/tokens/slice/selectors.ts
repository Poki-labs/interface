import { SerializedTokenMap } from 'poki/src/features/tokens/slice/types'
import { PokiState } from 'poki/src/state/pokiReducer'

// selectors

export const dismissedWarningTokensSelector = (state: PokiState): SerializedTokenMap =>
  state.tokens.dismissedTokenWarnings

export const tagTokensSelector = (state: PokiState): string[] => state.tokens.tagTokens
