import { UniverseChainId } from 'poki/src/features/chains/types'
import { filterChainIdsByFeatureFlag } from 'poki/src/features/chains/utils'
import { FeatureFlags } from 'poki/src/features/gating/flags'
import { useFeatureFlag } from 'poki/src/features/gating/hooks'
import { useMemo } from 'react'

// Used to feature flag chains. If a chain is not included in the object, it is considered enabled by default.
export function useFeatureFlaggedChainIds(): UniverseChainId[] {
  // You can use the useFeatureFlag hook here to enable/disable chains based on feature flags.
  // Example: [ChainId.BLAST]: useFeatureFlag(FeatureFlags.BLAST)
  // IMPORTANT: Don't forget to also update getEnabledChainIdsSaga
  const monadTestnetEnabled = useFeatureFlag(FeatureFlags.MonadTestnet)
  const unichainEnabled = useFeatureFlag(FeatureFlags.Unichain)

  return useMemo(
    () =>
      filterChainIdsByFeatureFlag({
        [UniverseChainId.MonadTestnet]: monadTestnetEnabled,
        [UniverseChainId.Unichain]: unichainEnabled,
      }),
    [monadTestnetEnabled, unichainEnabled],
  )
}
