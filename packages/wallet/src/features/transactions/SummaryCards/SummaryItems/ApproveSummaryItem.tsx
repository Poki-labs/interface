import { useTranslation } from 'react-i18next'
import { useLocalizationContext } from 'poki/src/features/language/LocalizationContext'
import { useCurrencyInfo } from 'poki/src/features/tokens/useCurrencyInfo'
import { ApproveTransactionInfo, TransactionDetails } from 'poki/src/features/transactions/types/transactionDetails'
import { getSymbolDisplayText } from 'poki/src/utils/currency'
import { buildCurrencyId } from 'poki/src/utils/currencyId'
import { NumberType } from 'utilities/src/format/types'
import { SummaryItemProps } from 'wallet/src/features/transactions/SummaryCards/types'

const INFINITE_AMOUNT = 'INF'
const ZERO_AMOUNT = '0.0'

export function ApproveSummaryItem({
  transaction,
  index,
}: SummaryItemProps & {
  transaction: TransactionDetails & { typeInfo: ApproveTransactionInfo }
}) {
  const { t } = useTranslation()
  const { formatNumberOrString } = useLocalizationContext()
  const currencyInfo = useCurrencyInfo(buildCurrencyId(transaction.chainId, transaction.typeInfo.tokenAddress))

  const { approvalAmount } = transaction.typeInfo

  const amount =
    approvalAmount === INFINITE_AMOUNT
      ? t('transaction.amount.unlimited')
      : approvalAmount && approvalAmount !== ZERO_AMOUNT
        ? formatNumberOrString({ value: approvalAmount, type: NumberType.TokenNonTx })
        : ''

  return <>{`${amount ? amount + ' ' : ''}${getSymbolDisplayText(currencyInfo?.currency.symbol) ?? ''}`}</>
}
