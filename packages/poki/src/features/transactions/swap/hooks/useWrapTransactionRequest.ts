import { Contract, providers } from 'ethers/lib/ethers'
import { Weth } from 'poki/src/abis/types'
import WETH_ABI from 'poki/src/abis/weth.json'
import { getWrappedNativeAddress } from 'poki/src/constants/addresses'
import { useProvider } from 'poki/src/contexts/PokiContext'
import { AccountMeta } from 'poki/src/features/accounts/types'
import { UniverseChainId } from 'poki/src/features/chains/types'
import { DerivedSwapInfo } from 'poki/src/features/transactions/swap/types/derivedSwapInfo'
import { isPokiX } from 'poki/src/features/transactions/swap/utils/routing'
import { WrapType } from 'poki/src/features/transactions/types/wrap'
import { Currency, CurrencyAmount } from 'poki/src/sdk-core'
import { useCallback } from 'react'
import { useAsyncData } from 'utilities/src/react/hooks'

export async function getWethContract(chainId: UniverseChainId, provider: providers.Provider): Promise<Weth> {
  return new Contract(getWrappedNativeAddress(chainId), WETH_ABI, provider) as Weth
}

export function useWrapTransactionRequest(
  derivedSwapInfo: DerivedSwapInfo,
  account?: AccountMeta,
): providers.TransactionRequest | undefined {
  const { chainId, wrapType, currencyAmounts, trade } = derivedSwapInfo
  const provider = useProvider(chainId)
  const isPokiXWrap = Boolean(trade.trade && isPokiX(trade.trade) && trade.trade.needsWrap)

  const transactionFetcher = useCallback(
    () => getWrapTransactionRequest(provider, isPokiXWrap, chainId, account?.address, wrapType, currencyAmounts.input),
    [provider, isPokiXWrap, chainId, account, wrapType, currencyAmounts.input],
  )

  return useAsyncData(transactionFetcher).data
}

export const getWrapTransactionRequest = async (
  provider: providers.Provider | undefined,
  isPokiXWrap: boolean,
  chainId: UniverseChainId,
  address: Address | undefined,
  wrapType: WrapType,
  currencyAmountIn: Maybe<CurrencyAmount<Currency>>,
): Promise<providers.TransactionRequest | undefined> => {
  if (!currencyAmountIn || !provider || (wrapType === WrapType.NotApplicable && !isPokiXWrap)) {
    return undefined
  }

  const wethContract = await getWethContract(chainId, provider)
  const wethTx =
    wrapType === WrapType.Wrap || isPokiXWrap
      ? await wethContract.populateTransaction.deposit({
          value: `0x${currencyAmountIn.quotient.toString(16)}`,
        })
      : await wethContract.populateTransaction.withdraw(`0x${currencyAmountIn.quotient.toString(16)}`)

  return { ...wethTx, from: address, chainId }
}
