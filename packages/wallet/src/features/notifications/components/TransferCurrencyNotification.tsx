import { TokenLogo } from 'poki/src/components/CurrencyLogo/TokenLogo'
import { useLocalizationContext } from 'poki/src/features/language/LocalizationContext'
import { TransferCurrencyTxNotification } from 'poki/src/features/notifications/types'
import { useCurrency } from 'poki/src/features/tokens/useCurrencyInfo'
import { TransactionStatus, TransactionType } from 'poki/src/features/transactions/types/transactionDetails'
import { getSwapTokenLogo } from 'poki/src/utils/token-logo'
import { Unitag } from 'ui/src/components/icons'
import { useWalletNavigation } from 'wallet/src/contexts/WalletNavigationContext'
import { NotificationToast } from 'wallet/src/features/notifications/components/NotificationToast'
import { NOTIFICATION_ICON_SIZE } from 'wallet/src/features/notifications/constants'
import { formTransferCurrencyNotificationTitle } from 'wallet/src/features/notifications/utils'
import { useDisplayName } from 'wallet/src/features/wallet/hooks'
import { DisplayNameType } from 'wallet/src/features/wallet/types'

export function TransferCurrencyNotification({
  notification,
}: {
  notification: TransferCurrencyTxNotification
}): JSX.Element {
  const formatter = useLocalizationContext()
  const { address, tokenAddress, currencyAmountRaw, txType, txStatus, hideDelay } = notification
  const senderOrRecipient = txType === TransactionType.Send ? notification.recipient : notification.sender
  const { name: displayName, type: displayNameType } =
    useDisplayName(senderOrRecipient, { includeUnitagSuffix: false }) ?? {}

  const currency = useCurrency(tokenAddress)

  // Transfer canceled title doesn't end with the display name
  const showUnicon = txStatus !== TransactionStatus.Canceled && displayNameType === DisplayNameType.Unitag

  const title = formTransferCurrencyNotificationTitle(
    formatter,
    txType,
    txStatus,
    currency,
    tokenAddress,
    currencyAmountRaw,
    displayNameType !== DisplayNameType.Address && displayName ? displayName : senderOrRecipient,
  )

  const { navigateToAccountActivityList } = useWalletNavigation()

  const icon = (
    <TokenLogo
      name={currency?.name}
      size={NOTIFICATION_ICON_SIZE}
      symbol={currency?.symbol}
      url={getSwapTokenLogo(tokenAddress)}
    />
  )

  return (
    <NotificationToast
      address={address}
      hideDelay={hideDelay}
      icon={icon}
      postCaptionElement={showUnicon ? <Unitag size="$icon.24" /> : undefined}
      title={title}
      onPress={navigateToAccountActivityList}
    />
  )
}
