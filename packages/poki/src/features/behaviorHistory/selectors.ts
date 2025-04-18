import { PokiState } from 'poki/src/state/pokiReducer'

export const selectHasViewedBridgingBanner = (state: PokiState): boolean =>
  state.pokiBehaviorHistory.hasViewedBridgingBanner === true

export const selectHasDismissedBridgingWarning = (state: PokiState): boolean =>
  state.pokiBehaviorHistory.hasDismissedBridgingWarning === true

export const selectHasDismissedLowNetworkTokenWarning = (state: PokiState): boolean =>
  state.pokiBehaviorHistory.hasDismissedLowNetworkTokenWarning === true

export const selectHasDismissedUnichainColdBanner = (state: PokiState): boolean =>
  state.pokiBehaviorHistory.unichainPromotion?.coldBannerDismissed === true

export const selectHasDismissedUnichainWarmBanner = (state: PokiState): boolean =>
  state.pokiBehaviorHistory.unichainPromotion?.warmBannerDismissed === true

export const selectHasSeenUnichainPromotionNetworkSelectorAnimation = (state: PokiState): boolean =>
  state.pokiBehaviorHistory.unichainPromotion?.networkSelectorAnimationSeen === true

export const selectHasSeenUnichainPromotionNetworkSelectorTooltip = (state: PokiState): boolean =>
  state.pokiBehaviorHistory.unichainPromotion?.networkSelectorTooltipSeen === true

export const selectHasSeenUnichainPromotionBridgingTooltip = (state: PokiState): boolean =>
  state.pokiBehaviorHistory.unichainPromotion?.bridgingTooltipSeen === true

export const selectHasSeenUnichainPromotionBridgingAnimation = (state: PokiState): boolean =>
  state.pokiBehaviorHistory.unichainPromotion?.bridgingAnimationSeen === true

export const selectIsFirstUnichainBridgeSelection = (state: PokiState): boolean =>
  state.pokiBehaviorHistory.unichainPromotion?.isFirstUnichainBridgeSelection === true
