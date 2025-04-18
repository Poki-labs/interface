import { WarningModal } from 'poki/src/components/modals/WarningModal/WarningModal'
import { LearnMoreLink } from 'poki/src/components/text/LearnMoreLink'
import { pokiWalletUrls } from 'poki/src/constants/urls'
import { ModalName } from 'poki/src/features/telemetry/constants'
import { useTranslation } from 'react-i18next'
import { useSporeColors } from 'ui/src'
import { ShieldCheck } from 'ui/src/components/icons'

export function SwapProtectionInfoModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }): JSX.Element {
  const colors = useSporeColors()
  const { t } = useTranslation()

  return (
    <WarningModal
      backgroundIconColor={colors.DEP_accentSuccessSoft.val}
      caption={t('swap.settings.protection.description')}
      rejectText={t('common.button.close')}
      rejectButtonTheme="tertiary"
      icon={<ShieldCheck color="$statusSuccess" size="$icon.24" />}
      isOpen={isOpen}
      modalName={ModalName.SwapProtection}
      title={t('swap.settings.protection.title')}
      onClose={onClose}
    >
      <LearnMoreLink url={pokiWalletUrls.helpArticleUrls.swapProtection} />
    </WarningModal>
  )
}
