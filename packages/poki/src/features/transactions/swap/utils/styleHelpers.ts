import { SLIPPAGE_CRITICAL_TOLERANCE } from 'poki/src/constants/transactions'
import { ColorTokens } from 'ui/src'

export const getSlippageWarningColor = (
  customSlippageValue: number,
  autoSlippageTolerance: number,
  fallbackColorValue?: ColorTokens,
): ColorTokens => {
  if (customSlippageValue >= SLIPPAGE_CRITICAL_TOLERANCE) {
    return '$statusCritical'
  }

  if (customSlippageValue > autoSlippageTolerance) {
    return '$statusWarning'
  }

  return fallbackColorValue ?? '$neutral2'
}
