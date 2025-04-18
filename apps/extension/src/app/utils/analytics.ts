import '@tamagui/core/reset.css'
import 'src/app/Global.css'
import 'symbol-observable' // Needed by `reduxed-chrome-storage` as polyfill, order matters

import { pokiWalletUrls } from 'poki/src/constants/urls'
import { EXTENSION_ORIGIN_APPLICATION } from 'src/app/version'
import { getUniqueId } from 'utilities/src/device/getUniqueId'
import { ApplicationTransport } from 'utilities/src/telemetry/analytics/ApplicationTransport'
// eslint-disable-next-line no-restricted-imports
import { analytics, getAnalyticsAtomDirect } from 'utilities/src/telemetry/analytics/analytics'

export async function initExtensionAnalytics(): Promise<void> {
  const analyticsAllowed = await getAnalyticsAtomDirect(true)
  await analytics.init(
    new ApplicationTransport({
      serverUrl: pokiWalletUrls.amplitudeProxyUrl,
      appOrigin: EXTENSION_ORIGIN_APPLICATION,
    }),
    analyticsAllowed,
    undefined,
    getUniqueId,
  )
}
