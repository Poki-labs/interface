import { CurrencyIdToVisibility, NFTKeyToVisibility, PositionKeyToVisibility } from 'poki/src/features/visibility/slice'
import { PokiRootState } from 'poki/src/state'

export const selectPositionsVisibility = (state: PokiRootState): PositionKeyToVisibility =>
  state.visibility.positions || {}

export const selectTokensVisibility = (state: PokiRootState): CurrencyIdToVisibility => state.visibility.tokens || {}

export const selectNftsVisibility = (state: PokiRootState): NFTKeyToVisibility => state.visibility.nfts || {}
