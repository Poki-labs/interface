import { useEffect } from 'react'
import { useEnabledChains } from 'poki/src/features/chains/hooks/useEnabledChains'
import { WALLET_TESTNET_CONFIG } from 'poki/src/features/telemetry/constants'
import { setAttributesToDatadog } from 'utilities/src/logger/datadog/Datadog'
// eslint-disable-next-line no-restricted-imports
import { analytics } from 'utilities/src/telemetry/analytics/analytics'

export function useTestnetModeForLoggingAndAnalytics(): void {
  const { isTestnetModeEnabled } = useEnabledChains()
  useEffect(() => {
    analytics.setTestnetMode(isTestnetModeEnabled, WALLET_TESTNET_CONFIG)
    setAttributesToDatadog({ testnetMode: isTestnetModeEnabled }).catch(() => undefined)
  }, [isTestnetModeEnabled])
}
