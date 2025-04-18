import { SharedEventName } from 'analytics-events/src/index'
import { CurrencyInfo } from 'poki/src/features/dataApi/types'
import { useLocalizationContext } from 'poki/src/features/language/LocalizationContext'
import { ElementName, ModalName } from 'poki/src/features/telemetry/constants'
import { sendAnalyticsEvent } from 'poki/src/features/telemetry/send'
import { ValueType } from 'poki/src/features/tokens/getCurrencyAmount'
import { useCurrencyInfo } from 'poki/src/features/tokens/useCurrencyInfo'
import { isPokiX } from 'poki/src/features/transactions/swap/utils/routing'
import { TransactionDetails, isFinalizedTx } from 'poki/src/features/transactions/types/transactionDetails'
import { buildCurrencyId, buildNativeCurrencyId } from 'poki/src/utils/currencyId'
import { useCallback } from 'react'
import { isWeb } from 'ui/src'
import { useWalletNavigation } from 'wallet/src/contexts/WalletNavigationContext'
import { useFormattedCurrencyAmountAndUSDValue } from 'wallet/src/features/transactions/SummaryCards/DetailsModal/utils'

export function useNetworkFee(transactionDetails: TransactionDetails): {
  value: string
  amount: string
} {
  const formatter = useLocalizationContext()

  const currencyId = transactionDetails.networkFee
    ? buildCurrencyId(transactionDetails.chainId, transactionDetails.networkFee.tokenAddress)
    : buildNativeCurrencyId(transactionDetails.chainId)
  const currencyInfo = useCurrencyInfo(currencyId)

  const currencyAmountRaw =
    transactionDetails.networkFee?.quantity != null
      ? transactionDetails.networkFee.quantity
      : isFinalizedTx(transactionDetails)
        ? '0'
        : undefined

  return useFormattedCurrencyAmountAndUSDValue({
    currency: currencyInfo?.currency,
    currencyAmountRaw,
    valueType: ValueType.Exact,
    formatter,
    isApproximateAmount: false,
    isPokiX: isPokiX(transactionDetails),
  })
}

export function useTokenDetailsNavigation(currency: Maybe<CurrencyInfo>, onClose?: () => void): () => void {
  const { navigateToTokenDetails } = useWalletNavigation()

  return useCallback(() => {
    if (currency) {
      sendAnalyticsEvent(SharedEventName.ELEMENT_CLICKED, {
        element: ElementName.TokenItem,
        modal: ModalName.TransactionDetails,
      })

      navigateToTokenDetails(currency.currencyId)
      if (!isWeb) {
        onClose?.()
      }
    }
  }, [currency, navigateToTokenDetails, onClose])
}
