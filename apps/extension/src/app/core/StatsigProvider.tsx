import { config } from 'poki/src/config'
import { pokiWalletUrls } from 'poki/src/constants/urls'
import { StatsigCustomAppValue } from 'poki/src/features/gating/constants'
import { StatsigOptions, StatsigProvider, StatsigUser } from 'poki/src/features/gating/sdk/statsig'
import { useEffect, useState } from 'react'
import { initializeDatadog } from 'src/app/datadog'
import { getStatsigEnvironmentTier } from 'src/app/version'
import Statsig from 'statsig-js' // Use JS package for browser
import { getUniqueId } from 'utilities/src/device/getUniqueId'
import { useAsyncData } from 'utilities/src/react/hooks'

async function getStatsigUser(): Promise<StatsigUser> {
  return {
    userID: await getUniqueId(),
    appVersion: process.env.VERSION,
    custom: {
      app: StatsigCustomAppValue.Extension,
    },
  }
}

export function ExtensionStatsigProvider({
  children,
  appName,
}: {
  children: React.ReactNode
  appName: string
}): JSX.Element {
  const { data: storedUser } = useAsyncData(getStatsigUser)
  const [user, setUser] = useState<StatsigUser>({
    userID: undefined,
    custom: {
      app: StatsigCustomAppValue.Extension,
    },
    appVersion: process.env.VERSION,
  })
  const [initFinished, setInitFinished] = useState(false)

  useEffect(() => {
    if (storedUser && initFinished) {
      setUser(storedUser)
    }
  }, [storedUser, initFinished])

  const options: StatsigOptions = {
    environment: {
      tier: getStatsigEnvironmentTier(),
    },
    api: pokiWalletUrls.statsigProxyUrl,
    disableAutoMetricsLogging: true,
    disableErrorLogging: true,
    initCompletionCallback: () => {
      setInitFinished(true)
      initializeDatadog(appName).catch(() => undefined)
    },
  }

  return (
    <StatsigProvider options={options} sdkKey={config.statsigApiKey} user={user} waitForInitialization={false}>
      {children}
    </StatsigProvider>
  )
}

export async function initStatSigForBrowserScripts(): Promise<void> {
  await Statsig.initialize(config.statsigApiKey, await getStatsigUser(), {
    api: pokiWalletUrls.statsigProxyUrl,
    environment: {
      tier: getStatsigEnvironmentTier(),
    },
  })
}
