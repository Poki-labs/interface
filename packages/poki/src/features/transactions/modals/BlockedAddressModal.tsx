import { WarningModal } from 'poki/src/components/modals/WarningModal/WarningModal'
import { WarningSeverity } from 'poki/src/components/modals/WarningModal/types'
import { ModalName } from 'poki/src/features/telemetry/constants'
import { useTranslation } from 'react-i18next'

export function BlockedAddressModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }): JSX.Element {
  const { t } = useTranslation()

  return (
    <WarningModal
      caption={t('send.warning.blocked.modal.message')}
      rejectText={t('common.button.understand')}
      isOpen={isOpen}
      modalName={ModalName.BlockedAddress}
      severity={WarningSeverity.None}
      title={t('send.warning.blocked.modal.title')}
      onClose={onClose}
    />
  )
}
