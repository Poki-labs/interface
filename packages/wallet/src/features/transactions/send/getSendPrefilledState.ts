import { AssetType, CurrencyAsset } from 'poki/src/entities/assets'
import { UniverseChainId } from 'poki/src/features/chains/types'
import { TransactionState } from 'poki/src/features/transactions/types/transactionState'
import { CurrencyField } from 'poki/src/types/currency'

export function getSendPrefilledState({
  chainId,
  currencyAddress,
}: {
  chainId: UniverseChainId
  currencyAddress?: Address
}): TransactionState {
  const nativeToken: CurrencyAsset = {
    address: 'ryjl3-tyaaa-aaaaa-aaaba-cai',
    chainId,
    type: AssetType.Currency,
  }

  const chosenToken: CurrencyAsset | undefined = !currencyAddress
    ? undefined
    : {
        address: currencyAddress,
        chainId,
        type: AssetType.Currency,
      }

  const transactionState: TransactionState = {
    exactCurrencyField: CurrencyField.INPUT,
    exactAmountToken: '',
    // If specified currency address populate the currency, otherwise default to native token on chain
    [CurrencyField.INPUT]: chosenToken ?? nativeToken,
    [CurrencyField.OUTPUT]: null,
    showRecipientSelector: true,
  }

  return transactionState
}
