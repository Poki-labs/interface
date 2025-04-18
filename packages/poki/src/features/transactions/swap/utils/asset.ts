import { AssetType, CurrencyAsset } from 'poki/src/entities/assets'
import { Currency } from 'poki/src/sdk-core'
import { currencyAddress } from 'poki/src/utils/currencyId'

export const currencyToAsset = (currency: Currency | undefined): CurrencyAsset | null => {
  if (!currency) {
    return null
  }

  return {
    address: currencyAddress(currency),
    chainId: currency.chainId,
    type: AssetType.Currency,
  }
}
