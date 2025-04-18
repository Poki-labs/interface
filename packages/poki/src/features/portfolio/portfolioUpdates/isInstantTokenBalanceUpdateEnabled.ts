import { FeatureFlags, getFeatureFlagName } from 'poki/src/features/gating/flags'
import { Statsig } from 'poki/src/features/gating/sdk/statsig'

export function isInstantTokenBalanceUpdateEnabled(): boolean {
  return Statsig.checkGate(getFeatureFlagName(FeatureFlags.InstantTokenBalanceUpdate))
}
