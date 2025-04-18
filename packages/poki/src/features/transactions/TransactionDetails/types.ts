import { WarningSeverity } from 'poki/src/components/modals/WarningModal/types'
import { CurrencyInfo } from 'poki/src/features/dataApi/types'
import { TokenProtectionWarning } from 'poki/src/features/tokens/safetyUtils'
import { Percent } from 'poki/src/sdk-core'

export type FoTFeeType = 'buy' | 'sell'

export type FeeOnTransferFeeGroupProps = {
  inputTokenInfo: TokenFeeInfo
  outputTokenInfo: TokenFeeInfo
}

export type TokenFeeInfo = {
  currencyInfo: Maybe<CurrencyInfo>
  tokenSymbol: string
  fee: Percent
  formattedUsdAmount: string
  formattedAmount: string
}

export type TokenWarningProps = {
  currencyInfo: Maybe<CurrencyInfo>
  tokenProtectionWarning: TokenProtectionWarning
  severity: WarningSeverity
}
