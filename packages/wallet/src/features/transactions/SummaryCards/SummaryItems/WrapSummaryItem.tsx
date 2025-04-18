import { SplitLogo } from 'poki/src/components/CurrencyLogo/SplitLogo'
import { useLocalizationContext } from 'poki/src/features/language/LocalizationContext'
import { useNativeCurrencyInfo, useWrappedNativeCurrencyInfo } from 'poki/src/features/tokens/useCurrencyInfo'
import { TransactionDetails, WrapTransactionInfo } from 'poki/src/features/transactions/types/transactionDetails'
import { getFormattedCurrencyAmount } from 'poki/src/utils/currency'
import { useMemo } from 'react'
import { TransactionSummaryLayout } from 'wallet/src/features/transactions/SummaryCards/SummaryItems/TransactionSummaryLayout'
import { SummaryItemProps } from 'wallet/src/features/transactions/SummaryCards/types'
import { TXN_HISTORY_ICON_SIZE } from 'wallet/src/features/transactions/SummaryCards/utils'

export function WrapSummaryItem({
  transaction,
  index,
}: SummaryItemProps & {
  transaction: TransactionDetails & { typeInfo: WrapTransactionInfo }
}): JSX.Element {
  const formatter = useLocalizationContext()
  const { unwrapped } = transaction.typeInfo

  const nativeCurrencyInfo = useNativeCurrencyInfo(transaction.chainId)
  const wrappedCurrencyInfo = useWrappedNativeCurrencyInfo(transaction.chainId)

  const caption = useMemo(() => {
    if (!nativeCurrencyInfo || !wrappedCurrencyInfo) {
      return ''
    }

    const inputCurrencyInfo = unwrapped ? wrappedCurrencyInfo : nativeCurrencyInfo
    const outputCurrencyInfo = unwrapped ? nativeCurrencyInfo : wrappedCurrencyInfo

    const { currency: inputCurrency } = inputCurrencyInfo
    const { currency: outputCurrency } = outputCurrencyInfo
    const currencyAmount = getFormattedCurrencyAmount(inputCurrency, transaction.typeInfo.currencyAmountRaw, formatter)
    const otherCurrencyAmount = getFormattedCurrencyAmount(
      outputCurrency,
      transaction.typeInfo.currencyAmountRaw,
      formatter,
    )
    return `${currencyAmount}${inputCurrency.symbol} → ${otherCurrencyAmount}${outputCurrency.symbol}`
  }, [nativeCurrencyInfo, transaction.typeInfo.currencyAmountRaw, unwrapped, wrappedCurrencyInfo, formatter])

  const icon = useMemo(
    () => (
      <SplitLogo
        chainId={transaction.chainId}
        inputCurrencyInfo={unwrapped ? wrappedCurrencyInfo : nativeCurrencyInfo}
        outputCurrencyInfo={unwrapped ? nativeCurrencyInfo : wrappedCurrencyInfo}
        size={TXN_HISTORY_ICON_SIZE}
      />
    ),
    [nativeCurrencyInfo, transaction.chainId, unwrapped, wrappedCurrencyInfo],
  )

  return <TransactionSummaryLayout caption={caption} icon={icon} index={index} transaction={transaction} />
}
