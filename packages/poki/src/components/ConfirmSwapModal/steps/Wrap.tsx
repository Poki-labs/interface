import { StepRowProps, StepRowSkeleton } from 'poki/src/components/ConfirmSwapModal/steps/StepRowSkeleton'
import { StepStatus } from 'poki/src/components/ConfirmSwapModal/types'
import { pokiWalletUrls } from 'poki/src/constants/urls'
import { WrapTransactionStep } from 'poki/src/features/transactions/swap/types/steps'
import { useTranslation } from 'react-i18next'

export function WrapTransactionStepRow({ step, status }: StepRowProps<WrapTransactionStep>): JSX.Element {
  const { t } = useTranslation()

  const { amount } = step
  const { currency } = amount
  // FIXME: Verify WALL-5906
  const symbol = currency.symbol ?? ''

  const title = {
    [StepStatus.Active]: t('common.wrapIn', { symbol }),
    [StepStatus.InProgress]: t('common.wrappingToken', { symbol }),
    [StepStatus.Preview]: t('common.wrap', { symbol }),
    [StepStatus.Complete]: t('common.wrap', { symbol }),
  }[status]

  return (
    <StepRowSkeleton
      title={title}
      currency={currency}
      learnMore={{
        url: pokiWalletUrls.helpArticleUrls.wethExplainer,
        text: t('common.whyWrap', { symbol }),
      }}
      status={status}
    />
  )
}
