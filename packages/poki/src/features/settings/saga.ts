import { UniverseChainId } from 'poki/src/features/chains/types'
import { filterChainIdsByFeatureFlag, getEnabledChains } from 'poki/src/features/chains/utils'
import { FeatureFlags } from 'poki/src/features/gating/flags'
import { getFeatureFlag } from 'poki/src/features/gating/hooks'
import { selectIsTestnetModeEnabled } from 'poki/src/features/settings/selectors'
import { call, select } from 'typed-redux-saga'

export function* getEnabledChainIdsSaga() {
  const isTestnetModeEnabled = yield* select(selectIsTestnetModeEnabled)

  const monadTestnetEnabled = getFeatureFlag(FeatureFlags.MonadTestnet)
  const unichainEnabled = getFeatureFlag(FeatureFlags.Unichain)

  const featureFlaggedChainIds = filterChainIdsByFeatureFlag({
    [UniverseChainId.MonadTestnet]: monadTestnetEnabled,
    [UniverseChainId.Unichain]: unichainEnabled,
  })

  return yield* call(getEnabledChains, {
    isTestnetModeEnabled,
    featureFlaggedChainIds,
  })
}
