import { useGlobalContext } from 'poki/src/components/GlobalProvider'
import { UniverseChainId } from 'poki/src/features/chains/types'
import { CurrencyInfo } from 'poki/src/features/dataApi/types'
import { Currency, Token } from 'poki/src/sdk-core'
import { buildNativeCurrencyId, buildWrappedNativeCurrencyId } from 'poki/src/utils/currencyId'
import { useMemo } from 'react'

export function useCurrencyInfo(_currencyId?: string): Maybe<CurrencyInfo> {
  const { allSwapTokens } = useGlobalContext()

  return useMemo(() => {
    if (!_currencyId) {
      return undefined
    }

    return allSwapTokens.find((e) => e.ledger_id.toString() === _currencyId)
  }, [_currencyId, allSwapTokens])
}

export function useCurrency(_currencyId?: string): Maybe<Currency> {
  const currencyInfo = useCurrencyInfo(_currencyId)

  return useMemo(() => {
    if (!currencyInfo) return undefined

    return new Token(
      currencyInfo.ledger_id.toString(),
      Number(currencyInfo.decimals),
      Number(currencyInfo.fee),
      currencyInfo.symbol,
      currencyInfo.name,
    )
  }, [currencyInfo])
}

export function useCurrencyInfos(_currencyIds: string[]): Maybe<CurrencyInfo>[] {
  const { allSwapTokens } = useGlobalContext()

  return useMemo(() => {
    const currencies: Maybe<CurrencyInfo>[] = []

    _currencyIds.forEach((currencyId) => {
      const currency = allSwapTokens.find((e) => e.ledger_id.toString() === currencyId)
      currencies.push(currency)
    })

    return currencies
  }, [allSwapTokens, _currencyIds])
}

export function useNativeCurrencyInfo(chainId: UniverseChainId): Maybe<CurrencyInfo> {
  const nativeCurrencyId = buildNativeCurrencyId(chainId)
  return useCurrencyInfo(nativeCurrencyId)
}

export function useWrappedNativeCurrencyInfo(chainId: UniverseChainId): Maybe<CurrencyInfo> {
  const wrappedCurrencyId = buildWrappedNativeCurrencyId(chainId)
  return useCurrencyInfo(wrappedCurrencyId)
}
