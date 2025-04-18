import { isUniverseChainId } from 'poki/src/features/chains/types'
import { useLocalizationContext } from 'poki/src/features/language/LocalizationContext'
import { ValueType, getCurrencyAmount } from 'poki/src/features/tokens/getCurrencyAmount'
import { STABLECOIN_AMOUNT_OUT, useUSDCPrice } from 'poki/src/features/transactions/swap/hooks/useUSDCPrice'
import { Currency } from 'poki/src/sdk-core'
import { useEffect, useRef } from 'react'

const NUM_DECIMALS_USD = 2
const NUM_DECIMALS_DISPLAY = 2

type USDTokenUpdaterProps = {
  isFiatInput: boolean
  exactAmountToken: string
  exactAmountFiat: string
  currency?: Currency
  onFiatAmountUpdated: (amount: string) => void
  onTokenAmountUpdated: (amount: string) => void
}

export function useUSDTokenUpdater({
  isFiatInput,
  exactAmountToken,
  exactAmountFiat,
  currency,
  onFiatAmountUpdated,
  onTokenAmountUpdated,
}: USDTokenUpdaterProps): void {
  const { price } = useUSDCPrice(currency)
  const shouldUseUSDRef = useRef(isFiatInput)
  const { convertFiatAmount, formatCurrencyAmount } = useLocalizationContext()
  const conversionRate = convertFiatAmount(1).amount

  useEffect(() => {
    shouldUseUSDRef.current = isFiatInput
  }, [isFiatInput])

  useEffect(() => {
    if (!currency || !price || !isUniverseChainId(currency.chainId)) {
      return undefined
    }

    const _exactAmountFiat = exactAmountFiat === '.' ? '0' : exactAmountFiat || '0'
    const exactAmountUSD = (parseFloat(_exactAmountFiat) / conversionRate).toFixed(NUM_DECIMALS_USD)

    if (shouldUseUSDRef.current) {
      const stablecoinAmount = getCurrencyAmount({
        value: exactAmountUSD,
        valueType: ValueType.Exact,
        currency: STABLECOIN_AMOUNT_OUT[currency.chainId]?.currency,
      })

      const currencyAmount = stablecoinAmount ? price?.invert().quote(stablecoinAmount) : undefined

      return onTokenAmountUpdated(currencyAmount?.toExact() ?? '')
    }

    const exactCurrencyAmount = getCurrencyAmount({
      value: exactAmountToken,
      valueType: ValueType.Exact,
      currency,
    })
    const usdPrice = exactCurrencyAmount ? price?.quote(exactCurrencyAmount) : undefined
    const fiatPrice = parseFloat(usdPrice?.toExact() ?? '0') * conversionRate

    return onFiatAmountUpdated(fiatPrice ? fiatPrice.toFixed(NUM_DECIMALS_DISPLAY) : '')
  }, [
    shouldUseUSDRef,
    exactAmountFiat,
    exactAmountToken,
    currency,
    price,
    conversionRate,
    formatCurrencyAmount,
    onFiatAmountUpdated,
    onTokenAmountUpdated,
  ])
}
