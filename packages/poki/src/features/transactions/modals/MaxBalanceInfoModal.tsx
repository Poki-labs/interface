import { WarningModal } from 'poki/src/components/modals/WarningModal/WarningModal'
import { WarningSeverity } from 'poki/src/components/modals/WarningModal/types'
import { InfoTooltip } from 'poki/src/components/tooltip/InfoTooltip'
import { ModalName } from 'poki/src/features/telemetry/constants'
import { PropsWithChildren } from 'react'
import { useTranslation } from 'react-i18next'
import { Text, isWeb } from 'ui/src'

interface MaxBalanceInfoModalProps {
  isModalOpen: boolean
  isTooltipEnabled: boolean
  onClose: () => void
}

// similar to `WarningInfo` but it's a controlled modal
export function MaxBalanceInfoModal({
  children,
  isModalOpen,
  isTooltipEnabled,
  onClose,
}: PropsWithChildren<MaxBalanceInfoModalProps>): JSX.Element {
  const { t } = useTranslation()

  if (isWeb) {
    if (!isTooltipEnabled) {
      return <>{children}</>
    }

    return (
      <InfoTooltip
        text={
          <Text variant="body4" textAlign="left" color="$neutral2">
            {t('transaction.networkCost.maxNativeBalance.description')}
          </Text>
        }
        placement="bottom"
        trigger={children}
      />
    )
  }

  return (
    <>
      {children}
      <WarningModal
        caption={t('transaction.networkCost.maxNativeBalance.description')}
        isOpen={isModalOpen}
        modalName={ModalName.NativeBalanceInfo}
        severity={WarningSeverity.Low}
        title={t('transaction.networkCost.maxNativeBalance.title')}
        rejectText={t('common.button.close')}
        rejectButtonTheme="tertiary"
        onClose={onClose}
        onReject={onClose}
      />
    </>
  )
}
