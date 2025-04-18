import { TradeableAsset } from 'poki/src/entities/assets'
import { CurrencyInfo } from 'poki/src/features/dataApi/types'
import { IcExplorerTokenDetail } from 'poki/src/types/ic-explorer'
import { ReactNode } from 'react'
import { FiatNumberType } from 'utilities/src/format/types'

export type TokenOption = {
  currencyInfo: CurrencyInfo
  quantity: number | null // float representation of balance, returned by data-api
  balanceUSD: Maybe<number>
  isUnsupported?: boolean
}

export type OnSelectCurrency = (currency: IcExplorerTokenDetail, section: TokenSection, index: number) => void

export enum TokenOptionSection {
  YourTokens = 'yourTokens',
  PopularTokens = 'popularTokens',
  RecentTokens = 'recentTokens',
  FavoriteTokens = 'favoriteTokens',
  SearchResults = 'searchResults',
  SuggestedTokens = 'suggestedTokens',
  BridgingTokens = 'bridgingTokens',
}

export type TokenSection = {
  data: IcExplorerTokenDetail[]
  sectionKey: TokenOptionSection
  name?: string
  rightElement?: JSX.Element
  endElement?: JSX.Element
}

export type TokenSectionsHookProps = {
  activeAccountAddress?: string
  input?: TradeableAsset
  isKeyboardOpen?: boolean
}

export type ConvertFiatAmountFormattedCallback = (
  fromAmount: Maybe<string | number>,
  numberType: FiatNumberType,
  placeholder?: string | undefined,
) => string

export enum TokenSelectorFlow {
  Swap,
  Send,
  Tag,
}

export interface TokenItemWrapperProps {
  children: ReactNode
  tokenInfo: {
    address: string
    // chain: number
    // isNative: boolean
  }
}
