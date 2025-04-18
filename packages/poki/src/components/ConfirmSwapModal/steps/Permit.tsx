import { StepRowProps, StepRowSkeleton } from 'poki/src/components/ConfirmSwapModal/steps/StepRowSkeleton'
import { StepStatus } from 'poki/src/components/ConfirmSwapModal/types'
import { pokiWalletUrls } from 'poki/src/constants/urls'
import { Permit2SignatureStep } from 'poki/src/features/transactions/swap/types/steps'
import { useTranslation } from 'react-i18next'
import { Flex, useSporeColors } from 'ui/src'
import { Sign } from 'ui/src/components/icons/Sign'

const SignIcon = (): JSX.Element => (
  <Flex centered width="$spacing24" height="$spacing24" borderRadius="$roundedFull" backgroundColor="$accent1">
    <Sign size="$icon.12" />
  </Flex>
)

export function Permit2SignatureStepRow({ status }: StepRowProps<Permit2SignatureStep>): JSX.Element {
  const { t } = useTranslation()
  const colors = useSporeColors()

  const title = status === StepStatus.Active ? t('common.signMessageWallet') : t('common.signMessage')

  return (
    <StepRowSkeleton
      title={title}
      icon={<SignIcon />}
      learnMore={{
        url: pokiWalletUrls.helpArticleUrls.approvalsExplainer,
        text: t('common.whySign'),
      }}
      rippleColor={colors.accent1.val}
      status={status}
    />
  )
}
