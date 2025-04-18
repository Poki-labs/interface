import { CurrencyAmount } from 'poki/src/sdk-core'
import { useMemo } from 'react'
import { ValueType, getCurrencyAmount } from 'poki/src/features/tokens/getCurrencyAmount'
import { useCurrency, useCurrencyInfo } from 'poki/src/features/tokens/useCurrencyInfo'
import { useTokenBalance } from 'poki/src/features/tokens/useTokenBalance'
import { TransactionState } from 'poki/src/features/transactions/types/transactionState'
import { CurrencyField } from 'poki/src/types/currency'
import { useActiveAccount } from 'wallet/src/features/wallet/hooks'

export function useDerivedSendInfo(state: TransactionState) {
  const {
    [CurrencyField.INPUT]: tradeableAsset,
    exactAmountToken,
    exactAmountFiat,
    recipient,
    isFiatInput,
    txId,
  } = state

  const activeAccount = useActiveAccount()

  const currencyInInfo = useCurrencyInfo(tradeableAsset?.address)
  const currencyIn = useCurrency(tradeableAsset?.address)

  const currencies = useMemo(
    () => ({
      [CurrencyField.INPUT]: currencyIn,
    }),
    [currencyIn],
  )

  const { result: tokenInBalance } = useTokenBalance({
    tokenId: currencyInInfo?.ledger_id.toString(),
    principal: activeAccount?.address,
  })

  const amountSpecified = useMemo(
    () =>
      getCurrencyAmount({
        value: exactAmountToken,
        valueType: ValueType.Exact,
        currency: currencyIn,
      }),
    [currencyIn, exactAmountToken],
  )
  const currencyAmounts = useMemo(
    () => ({
      [CurrencyField.INPUT]: amountSpecified,
    }),
    [amountSpecified],
  )

  console.log('amountSpecified: ', amountSpecified?.toExact())

  const currencyBalances = useMemo(
    () => ({
      [CurrencyField.INPUT]:
        currencyIn && tokenInBalance ? CurrencyAmount.fromRawAmount(currencyIn, tokenInBalance.toString()) : undefined,
    }),
    [currencyIn, tokenInBalance, tokenInBalance],
  )

  return useMemo(
    () => ({
      currencies,
      currencyAmounts,
      currencyBalances,
      currencyTypes: { [CurrencyField.INPUT]: tradeableAsset?.type },
      currencyInInfo,
      exactAmountToken,
      exactAmountFiat: exactAmountFiat ?? '',
      exactCurrencyField: CurrencyField.INPUT,
      isFiatInput,
      recipient,
      txId,
    }),
    [
      currencies,
      currencyAmounts,
      currencyBalances,
      currencyInInfo,
      exactAmountToken,
      exactAmountFiat,
      isFiatInput,
      recipient,
      tradeableAsset?.type,
      txId,
    ],
  )
}
