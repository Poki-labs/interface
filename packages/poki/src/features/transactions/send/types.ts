import { AssetType } from 'poki/src/entities/assets'
import { UniverseChainId } from 'poki/src/features/chains/types'
import { CurrencyInfo } from 'poki/src/features/dataApi/types'
import { GQLNftAsset } from 'poki/src/features/nfts/types'
import { BaseDerivedInfo } from 'poki/src/features/transactions/types/baseDerivedInfo'
import { CurrencyField } from 'poki/src/types/currency'

export type DerivedSendInfo = BaseDerivedInfo<CurrencyInfo | GQLNftAsset> & {
  currencyTypes: { [CurrencyField.INPUT]?: AssetType }
  currencyInInfo?: CurrencyInfo | null
  chainId: UniverseChainId
  exactAmountFiat: string
  exactCurrencyField: CurrencyField.INPUT
  isFiatInput?: boolean
  nftIn: GQLNftAsset | undefined
  recipient?: string
  txId?: string
}
