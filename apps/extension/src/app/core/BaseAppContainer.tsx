import { GlobalProvider } from 'poki/src/components/GlobalProvider'
import { BlankUrlProvider } from 'poki/src/contexts/UrlContext'
import { LocalizationContextProvider } from 'poki/src/features/language/LocalizationContext'
import Trace from 'poki/src/features/telemetry/Trace'
import i18n from 'poki/src/i18n'
import { PropsWithChildren } from 'react'
import { I18nextProvider } from 'react-i18next'
import { GraphqlProvider } from 'src/app/apollo'
import { TraceUserProperties } from 'src/app/components/Trace/TraceUserProperties'
import { ExtensionStatsigProvider } from 'src/app/core/StatsigProvider'
import { DatadogAppNameTag } from 'src/app/datadog'
import { getReduxStore } from 'src/store/store'
import { ErrorBoundary } from 'wallet/src/components/ErrorBoundary/ErrorBoundary'
import { SharedWalletProvider } from 'wallet/src/providers/SharedWalletProvider'

export function BaseAppContainer({
  children,
  appName,
}: PropsWithChildren<{ appName: DatadogAppNameTag }>): JSX.Element {
  return (
    <Trace>
      <ExtensionStatsigProvider appName={appName}>
        <I18nextProvider i18n={i18n}>
          <SharedWalletProvider reduxStore={getReduxStore()}>
            <ErrorBoundary>
              <GraphqlProvider>
                <BlankUrlProvider>
                  <GlobalProvider>
                    <LocalizationContextProvider>
                      <TraceUserProperties />
                      {children}
                    </LocalizationContextProvider>
                  </GlobalProvider>
                </BlankUrlProvider>
              </GraphqlProvider>
            </ErrorBoundary>
          </SharedWalletProvider>
        </I18nextProvider>
      </ExtensionStatsigProvider>
    </Trace>
  )
}
