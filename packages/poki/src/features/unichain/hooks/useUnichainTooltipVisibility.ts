import {
  selectHasSeenUnichainPromotionBridgingAnimation,
  selectHasSeenUnichainPromotionBridgingTooltip,
  selectHasSeenUnichainPromotionNetworkSelectorTooltip,
} from 'poki/src/features/behaviorHistory/selectors'
import { FeatureFlags } from 'poki/src/features/gating/flags'
import { useFeatureFlag } from 'poki/src/features/gating/hooks'
import { selectIsTestnetModeEnabled } from 'poki/src/features/settings/selectors'
import { useSelector } from 'react-redux'

export function useUnichainTooltipVisibility(): {
  shouldShowUnichainNetworkSelectorTooltip: boolean
  shouldShowUnichainBridgingTooltip: boolean
  shouldShowUnichainBridgingAnimation: boolean
} {
  const unichainEnabled = useFeatureFlag(FeatureFlags.Unichain)
  const unichainPromoEnabled = useFeatureFlag(FeatureFlags.UnichainPromo)
  const hasSeenUnichainPromotionNetworkSelectorTooltip = useSelector(
    selectHasSeenUnichainPromotionNetworkSelectorTooltip,
  )
  const hasSeenUnichainPromotionBridgingTooltip = useSelector(selectHasSeenUnichainPromotionBridgingTooltip)
  const hasSeenUnichainPromotionBridgingAnimation = useSelector(selectHasSeenUnichainPromotionBridgingAnimation)
  const isTestnetModeEnabled = useSelector(selectIsTestnetModeEnabled)

  // Don't show promotion if:
  // - unichain isn't enabled
  // - the feature flag is off
  // - testnet mode is on
  if (!unichainEnabled || !unichainPromoEnabled || isTestnetModeEnabled) {
    return {
      shouldShowUnichainNetworkSelectorTooltip: false,
      shouldShowUnichainBridgingTooltip: false,
      shouldShowUnichainBridgingAnimation: false,
    }
  }

  return {
    shouldShowUnichainNetworkSelectorTooltip: !hasSeenUnichainPromotionNetworkSelectorTooltip,
    shouldShowUnichainBridgingTooltip: !hasSeenUnichainPromotionBridgingTooltip,
    shouldShowUnichainBridgingAnimation: !hasSeenUnichainPromotionBridgingAnimation,
  }
}
