import { ValueType, getCurrencyAmount } from 'poki/src/features/tokens/getCurrencyAmount'
import { DerivedSwapInfo } from 'poki/src/features/transactions/swap/types/derivedSwapInfo'
import { Trade } from 'poki/src/features/transactions/swap/types/trade'
import { Currency, CurrencyAmount } from 'poki/src/sdk-core'
import { CurrencyField } from 'poki/src/types/currency'

export function getSwapFeeUsd({
  trade,
  outputAmount,
  outputAmountUsd,
}: {
  trade: Trade
  outputAmount: CurrencyAmount<Currency>
  outputAmountUsd: CurrencyAmount<Currency>
}): number | undefined {
  if (!trade.swapFee) {
    return undefined
  }

  const outputCurrencyPricePerUnitExact = (
    parseFloat(outputAmountUsd.toExact()) / parseFloat(outputAmount.toExact())
  ).toString()

  const currencyAmount = getCurrencyAmount({
    value: trade.swapFee.amount,
    valueType: ValueType.Raw,
    currency: trade.outputAmount.currency,
  })

  if (!currencyAmount) {
    return undefined
  }

  const feeUsd = parseFloat(outputCurrencyPricePerUnitExact) * parseFloat(currencyAmount.toExact())
  return feeUsd
}

export function getSwapFeeUsdFromDerivedSwapInfo(derivedSwapInfo: DerivedSwapInfo): number | undefined {
  if (
    !derivedSwapInfo.trade.trade ||
    !derivedSwapInfo.currencyAmounts[CurrencyField.OUTPUT] ||
    !derivedSwapInfo.currencyAmountsUSDValue[CurrencyField.OUTPUT]
  ) {
    return undefined
  }

  return getSwapFeeUsd({
    trade: derivedSwapInfo.trade.trade,
    outputAmount: derivedSwapInfo.currencyAmounts[CurrencyField.OUTPUT],
    outputAmountUsd: derivedSwapInfo.currencyAmountsUSDValue[CurrencyField.OUTPUT],
  })
}
