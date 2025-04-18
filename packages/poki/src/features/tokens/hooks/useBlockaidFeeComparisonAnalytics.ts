import { getNativeAddress } from 'poki/src/constants/addresses'
import { CurrencyInfo } from 'poki/src/features/dataApi/types'
import { FeatureFlags } from 'poki/src/features/gating/flags'
import { useFeatureFlag } from 'poki/src/features/gating/hooks'
import { PokiEventName } from 'poki/src/features/telemetry/constants/poki'
import { sendAnalyticsEvent } from 'poki/src/features/telemetry/send.web'
import { getTokenProtectionFeeOnTransfer } from 'poki/src/features/tokens/safetyUtils'
import { useEffect, useRef } from 'react'

/**
 * Logs an analytics event when there are discrepancies between our backend's and Blockaid's fee-on-transfer (FOT) detection.
 * This data helps the protocols team identify and improve FOT detection accuracy.
 *
 * @param currencyInfo - The result of useCurrencyInfo()
 */
export function useBlockaidFeeComparisonAnalytics(currencyInfo: Maybe<CurrencyInfo>): void {
  const isBlockaidFotLoggingEnabled = useFeatureFlag(FeatureFlags.BlockaidFotLogging)
  const sentEventCurrencyIdRef = useRef<string>()
  const { buyFeePercent, sellFeePercent } = getTokenProtectionFeeOnTransfer(currencyInfo)
  const blockaidBuyFeePercent = currencyInfo?.safetyInfo?.blockaidFees?.buyFeePercent ?? 0
  const blockaidSellFeePercent = currencyInfo?.safetyInfo?.blockaidFees?.sellFeePercent ?? 0

  useEffect(() => {
    if (!currencyInfo || !isBlockaidFotLoggingEnabled) {
      return
    }

    const normalizedBuyFee = buyFeePercent ?? 0
    const normalizedSellFee = sellFeePercent ?? 0

    // Only send if fees are different and we haven't sent for this token before
    if (
      sentEventCurrencyIdRef.current !== currencyInfo.currencyId &&
      currencyInfo.currency.symbol &&
      currencyInfo.currency.chainId &&
      (normalizedBuyFee !== blockaidBuyFeePercent || normalizedSellFee !== blockaidSellFeePercent)
    ) {
      const address = currencyInfo.currency.isToken
        ? currencyInfo.currency.address
        : getNativeAddress(currencyInfo.currency.chainId)

      sendAnalyticsEvent(PokiEventName.BlockaidFeesMismatch, {
        symbol: currencyInfo.currency.symbol,
        address,
        chainId: currencyInfo.currency.chainId,
        buyFeePercent,
        sellFeePercent,
        blockaidBuyFeePercent: currencyInfo?.safetyInfo?.blockaidFees?.buyFeePercent,
        blockaidSellFeePercent: currencyInfo?.safetyInfo?.blockaidFees?.sellFeePercent,
        attackType: currencyInfo.safetyInfo?.attackType,
        protectionResult: currencyInfo.safetyInfo?.protectionResult,
      })
      sentEventCurrencyIdRef.current = currencyInfo.currencyId
    }
  }, [
    buyFeePercent,
    sellFeePercent,
    blockaidBuyFeePercent,
    blockaidSellFeePercent,
    currencyInfo,
    isBlockaidFotLoggingEnabled,
  ])
}
