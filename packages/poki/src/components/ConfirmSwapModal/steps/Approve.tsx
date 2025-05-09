import { StepRowProps, StepRowSkeleton } from 'poki/src/components/ConfirmSwapModal/steps/StepRowSkeleton'
import { StepStatus } from 'poki/src/components/ConfirmSwapModal/types'
import { pokiWalletUrls } from 'poki/src/constants/urls'
import {
  TokenApprovalTransactionStep,
  TokenRevocationTransactionStep,
} from 'poki/src/features/transactions/swap/types/steps'
import { useTranslation } from 'react-i18next'

export function TokenApprovalTransactionStepRow({
  step,
  status,
}: StepRowProps<TokenApprovalTransactionStep>): JSX.Element {
  const { t } = useTranslation()
  const { token, pair } = step
  // FIXME: Verify WALL-5906
  const symbol = token.symbol ?? ''

  const title = {
    [StepStatus.Preview]: t('common.approveSpend', { symbol }),
    [StepStatus.Active]: t('common.wallet.approve'),
    [StepStatus.InProgress]: t('common.approvePending'),
    [StepStatus.Complete]: t('common.approveSpend', { symbol }),
  }[status]

  return (
    <StepRowSkeleton
      title={title}
      currency={token}
      pair={pair}
      learnMore={{
        url: pokiWalletUrls.helpArticleUrls.approvalsExplainer,
        text: t('common.whyApprove'),
      }}
      status={status}
    />
  )
}

export function TokenRevocationTransactionStepRow(props: StepRowProps<TokenRevocationTransactionStep>): JSX.Element {
  const { step, status } = props

  const { t } = useTranslation()
  const { token } = step
  // FIXME: Verify WALL-5906
  const symbol = token.symbol ?? ''

  const title = {
    [StepStatus.Preview]: t('common.resetLimit', { symbol }),
    [StepStatus.Active]: t('common.resetLimitWallet', { symbol }),
    [StepStatus.InProgress]: t('common.resettingLimit', { symbol }),
    [StepStatus.Complete]: t('common.resetLimit', { symbol }),
  }[status]

  return <StepRowSkeleton title={title} currency={token} status={status} />
}
