import { NetworkLogo } from 'poki/src/components/CurrencyLogo/NetworkLogo'
import { getChainLabel } from 'poki/src/features/chains/utils'
import { NetworkChangedBridgeNotification as NetworkChangedBridgeNotificationType } from 'poki/src/features/notifications/types'
import { Flex, Text } from 'ui/src'
import { Shuffle } from 'ui/src/components/icons/Shuffle'
import { iconSizes } from 'ui/src/theme'
import { NotificationToast } from 'wallet/src/features/notifications/components/NotificationToast'

export function NetworkChangedBridgeNotification({
  notification,
}: {
  notification: NetworkChangedBridgeNotificationType
}): JSX.Element {
  const fromNetwork = getChainLabel(notification.fromChainId)
  const toNetwork = getChainLabel(notification.toChainId)

  return (
    <NotificationToast
      smallToast
      hideDelay={notification.hideDelay}
      title=""
      contentOverride={
        <Flex row alignItems="center" gap="$spacing8" justifyContent="center">
          <Flex row centered gap="$spacing4">
            <NetworkLogo chainId={notification.fromChainId} size={iconSizes.icon20} />
            <Text variant="body2" color="$neutral1">
              {fromNetwork}
            </Text>
          </Flex>
          <Shuffle color="$neutral2" size={iconSizes.icon16} />
          <Flex row centered gap="$spacing4">
            <NetworkLogo chainId={notification.toChainId} size={iconSizes.icon20} />
            <Text variant="body2" color="$neutral1">
              {toNetwork}
            </Text>
          </Flex>
        </Flex>
      }
    />
  )
}
