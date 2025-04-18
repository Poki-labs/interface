import { ProtectionResult } from 'poki/src/data/graphql/poki-data-api/__generated__/types-and-hooks'
import { FoTPercent } from 'poki/src/features/tokens/TokenWarningModal'
import { IcExplorerTokenDetail } from 'poki/src/types/ic-explorer'

export enum TokenList {
  Default = 'default',
  NonDefault = 'non_default',
  Blocked = 'blocked',
}

export enum AttackType {
  Airdrop = 'airdrop',
  Impersonator = 'impersonator',
  HighFees = 'high-fees',
  Other = 'other',
}

export type SafetyInfo = {
  tokenList: TokenList
  attackType?: AttackType
  protectionResult: ProtectionResult
  blockaidFees?: FoTPercent
}

// export type CurrencyInfo = {
//   currency: Currency
//   currencyId: CurrencyId
//   safetyLevel: Maybe<SafetyLevel>
//   safetyInfo?: Maybe<SafetyInfo>
//   spamCode?: Maybe<SpamCode>
//   logoUrl: Maybe<string>
//   isSpam?: Maybe<boolean>
// }

export type CurrencyInfo = {
  fee: number
  decimals: number
  minting_account: undefined
  logo: string | undefined
  name: string
  ledger_id: string
  min_burn_amount: number
  max_supply: number | undefined
  index: number
  standard: string
  total_supply: number
  symbol: string
}

// Portfolio balance as exposed to the app
export type PortfolioBalance = {
  id: string
  cacheId: string
  quantity: number // float representation of balance
  balanceUSD: Maybe<number>
  currencyInfo: IcExplorerTokenDetail
  relativeChange24: Maybe<number>
  isHidden: Maybe<boolean>
}
