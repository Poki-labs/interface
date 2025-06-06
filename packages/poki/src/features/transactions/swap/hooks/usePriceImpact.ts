import { LocalizationContextState, useLocalizationContext } from 'poki/src/features/language/LocalizationContext'
import { ValueType, getCurrencyAmount } from 'poki/src/features/tokens/getCurrencyAmount'
import { DerivedSwapInfo } from 'poki/src/features/transactions/swap/types/derivedSwapInfo'
import { getSwapFeeUsdFromDerivedSwapInfo } from 'poki/src/features/transactions/swap/utils/getSwapFeeUsd'
import { isClassic, isPokiX } from 'poki/src/features/transactions/swap/utils/routing'
import { Currency, CurrencyAmount, Percent } from 'poki/src/sdk-core'
import { useMemo } from 'react'

function stringToUSDAmount(value: string | number | undefined, USDCurrency: Currency): Maybe<CurrencyAmount<Currency>> {
  if (!value) {
    return undefined
  }

  return getCurrencyAmount({
    value: value.toString().slice(0, USDCurrency.decimals),
    valueType: ValueType.Exact,
    currency: USDCurrency,
  })
}

/** Returns the price impact of the current trade, including PokiX trades. PokiX trades do not have typical pool-based price impact; we use a frontend-calculated metric. */
function getPokiXPriceImpact({ derivedSwapInfo }: { derivedSwapInfo: DerivedSwapInfo }): Percent | undefined {
  const trade = derivedSwapInfo.trade.trade
  const { input: inputUSD, output: outputUSD } = derivedSwapInfo.currencyAmountsUSDValue

  if (!trade || !isPokiX(trade) || !trade.quote.quote.classicGasUseEstimateUSD || !inputUSD || !outputUSD) {
    return undefined
  }

  const classicGasEstimateUSD = stringToUSDAmount(trade.quote.quote.classicGasUseEstimateUSD, inputUSD.currency)
  const swapFeeUSDString = getSwapFeeUsdFromDerivedSwapInfo(derivedSwapInfo)
  const swapFeeUSD =
    stringToUSDAmount(swapFeeUSDString, inputUSD.currency) ?? CurrencyAmount.fromRawAmount(inputUSD.currency, '0')

  if (!classicGasEstimateUSD) {
    return undefined
  }

  const result = outputUSD
    .add(classicGasEstimateUSD)
    .add(swapFeeUSD)
    .divide(inputUSD)
    .asFraction.subtract(1)
    .multiply(-1)

  return new Percent(result.numerator, result.denominator)
}

export function getPriceImpact(derivedSwapInfo: DerivedSwapInfo): Percent | undefined {
  const trade = derivedSwapInfo.trade.trade
  if (!trade) {
    return undefined
  }

  if (isPokiX(trade)) {
    return getPokiXPriceImpact({ derivedSwapInfo })
  } else if (isClassic(trade)) {
    return trade.priceImpact
  } else {
    return undefined
  }
}

export function formatPriceImpact(
  priceImpact: Percent,
  formatPercent: LocalizationContextState['formatPercent'],
): string | undefined {
  if (!priceImpact) {
    return undefined
  }

  const positiveImpactPrefix = priceImpact.lessThan(0) ? '+' : ''
  return `${positiveImpactPrefix}${formatPercent(priceImpact.multiply(-1).toFixed(3))}`
}

/** Returns the price impact of the current trade, including PokiX trades. PokiX trades do not have typical pool-based price impact; we use a frontend-calculated metric. */
export function usePriceImpact({ derivedSwapInfo }: { derivedSwapInfo: DerivedSwapInfo }): {
  priceImpact: Percent | undefined
  formattedPriceImpact: string | undefined
} {
  const { formatPercent } = useLocalizationContext()

  return useMemo(() => {
    const priceImpact = getPriceImpact(derivedSwapInfo)

    if (!priceImpact) {
      return { priceImpact: undefined, formattedPriceImpact: undefined }
    }

    const formattedPriceImpact = formatPriceImpact(priceImpact, formatPercent)

    return { priceImpact, formattedPriceImpact }
  }, [derivedSwapInfo, formatPercent])
}
