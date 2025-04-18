import { TFunction } from 'i18next'
import { NetworkLogo } from 'poki/src/components/CurrencyLogo/NetworkLogo'
import { getChainLabel } from 'poki/src/features/chains/utils'
import { NetworkChangedNotification as NetworkChangedNotificationType } from 'poki/src/features/notifications/types'
import { useTranslation } from 'react-i18next'
import { iconSizes } from 'ui/src/theme'
import { ONE_SECOND_MS } from 'utilities/src/time/time'
import { NotificationToast } from 'wallet/src/features/notifications/components/NotificationToast'

export function NetworkChangedNotification({
  notification: { chainId, flow, hideDelay = 2 * ONE_SECOND_MS },
}: {
  notification: NetworkChangedNotificationType
}): JSX.Element {
  const { t } = useTranslation()

  return (
    <NotificationToast
      smallToast
      hideDelay={hideDelay}
      icon={<NetworkLogo chainId={chainId} size={iconSizes.icon24} />}
      title={getTitle({ t, flow, chainId })}
    />
  )
}

function getTitle({
  t,
  flow,
  chainId,
}: {
  t: TFunction
} & Pick<NetworkChangedNotificationType, 'flow' | 'chainId'>): string {
  const network = getChainLabel(chainId)

  switch (flow) {
    case 'send':
      return t('notification.send.network', { network })
    case 'swap':
      return t('notification.swap.network', { network })
    default:
      return t('notification.network.changed', { network })
  }
}
