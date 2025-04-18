import { InfoLinkModal } from 'poki/src/components/modals/InfoLinkModal'
import { ModalName } from 'poki/src/features/telemetry/constants'
import { useTranslation } from 'react-i18next'
import { Flex } from 'ui/src'
import { Wrench } from 'ui/src/components/icons/Wrench'

type TestnetModeModalProps = {
  isOpen: boolean
  unsupported?: boolean
  descriptionCopy?: string
  showCloseButton?: boolean
  onClose: () => void
}

export function TestnetModeModal({
  isOpen,
  descriptionCopy,
  unsupported = false,
  showCloseButton = false,
  onClose,
}: TestnetModeModalProps): JSX.Element {
  const { t } = useTranslation()
  return (
    <InfoLinkModal
      title={unsupported ? t('common.notSupported') : t('settings.setting.wallet.testnetMode.title')}
      description={
        descriptionCopy ?? unsupported ? t('testnet.unsupported') : t('settings.setting.wallet.testnetMode.description')
      }
      isOpen={isOpen}
      buttonText={t('common.button.close')}
      buttonTheme="secondary"
      name={ModalName.TestnetMode}
      icon={
        <Flex centered backgroundColor="$surface3" borderRadius="$rounded12" p="$spacing12">
          <Wrench color="$neutral1" size="$icon.24" />
        </Flex>
      }
      showCloseButton={showCloseButton}
      height="max-content"
      onDismiss={onClose}
      onButtonPress={onClose}
    />
  )
}
