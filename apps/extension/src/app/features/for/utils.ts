import { SharedEventName } from 'analytics-events/src/index'
import { pokiWalletUrls } from 'poki/src/constants/urls'
import { getChainInfo } from 'poki/src/features/chains/chainInfo'
import { UniverseChainId } from 'poki/src/features/chains/types'
import { ElementNameType } from 'poki/src/features/telemetry/constants'
import { sendAnalyticsEvent } from 'poki/src/features/telemetry/send'
import { ExtensionScreens } from 'poki/src/types/screens/extension'
import { useDappContext } from 'src/app/features/dapp/DappContext'
import { useDappLastChainId } from 'src/app/features/dapp/hooks'
import { focusOrCreateInterfaceTab } from 'src/app/navigation/utils'
import { logger } from 'utilities/src/logger/logger'

export function useInterfaceBuyNavigator(element?: ElementNameType): () => void {
  const { dappUrl } = useDappContext()
  const dappChain = useDappLastChainId(dappUrl)

  return () => {
    sendAnalyticsEvent(SharedEventName.ELEMENT_CLICKED, {
      screen: ExtensionScreens.Home,
      element,
    })
    navigateToInterfaceFiatOnRamp(dappChain)
  }
}

export function navigateToInterfaceFiatOnRamp(chainId?: UniverseChainId): void {
  const chainParam = chainId ? `?chain=${getChainInfo(chainId).urlParam}` : ''
  focusOrCreateInterfaceTab({
    url: `${pokiWalletUrls.webInterfaceBuyUrl}${chainParam}`,
  }).catch((err) =>
    logger.error(err, {
      tags: {
        file: 'utils',
        function: 'redirectToInterfaceFiatOnRamp',
      },
    }),
  )
}
