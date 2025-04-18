import { useTranslation } from 'react-i18next'
import { AssetType } from 'poki/src/entities/assets'
import { useLocalizationContext } from 'poki/src/features/language/LocalizationContext'
import { useCurrencyInfo } from 'poki/src/features/tokens/useCurrencyInfo'
import { OffRampSaleInfo, TransactionDetails } from 'poki/src/features/transactions/types/transactionDetails'
import { getSymbolDisplayText } from 'poki/src/utils/currency'
import { buildCurrencyId } from 'poki/src/utils/currencyId'
import { LogoWithTxStatus } from 'wallet/src/components/CurrencyLogo/LogoWithTxStatus'
import { TransactionSummaryLayout } from 'wallet/src/features/transactions/SummaryCards/SummaryItems/TransactionSummaryLayout'
import { SummaryItemProps } from 'wallet/src/features/transactions/SummaryCards/types'
import { TXN_HISTORY_ICON_SIZE } from 'wallet/src/features/transactions/SummaryCards/utils'

export function OffRampTransferSummaryItem({
  transaction,
}: SummaryItemProps & {
  transaction: TransactionDetails & { typeInfo: OffRampSaleInfo }
}): JSX.Element {
  const { t } = useTranslation()
  const { formatNumberOrString } = useLocalizationContext()

  const { chainId, typeInfo } = transaction
  const { destinationTokenSymbol, destinationTokenAddress, destinationTokenAmount } = typeInfo

  const outputCurrencyInfo = useCurrencyInfo(buildCurrencyId(chainId, destinationTokenAddress))
  const cryptoAmount = `${typeInfo?.sourceAmount ?? ''} ${getSymbolDisplayText(typeInfo?.sourceCurrency)}`
  const cryptoSaleAmount = formatNumberOrString({ value: destinationTokenAmount }) + ' ' + destinationTokenSymbol

  return (
    <TransactionSummaryLayout
      caption={t('fiatOffRamp.summary.total', {
        cryptoAmount,
        fiatAmount: destinationTokenAmount === 0 ? destinationTokenSymbol : cryptoSaleAmount,
      })}
      icon={
        <LogoWithTxStatus
          assetType={AssetType.Currency}
          chainId={transaction.chainId}
          currencyInfo={outputCurrencyInfo}
          size={TXN_HISTORY_ICON_SIZE}
          txStatus={transaction.status}
          txType={transaction.typeInfo.type}
        />
      }
      transaction={transaction}
    />
  )
}
