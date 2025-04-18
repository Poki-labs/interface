import { PokiState } from 'poki/src/state/pokiReducer'

export const selectSwapStartTimestamp = (state: PokiState): number | undefined => state.timing.swap.startTimestamp
