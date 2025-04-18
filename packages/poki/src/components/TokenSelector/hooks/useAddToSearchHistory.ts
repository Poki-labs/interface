import { getNativeAddress } from 'poki/src/constants/addresses'
import { CurrencyInfo } from 'poki/src/features/dataApi/types'
import { SearchResultType, TokenSearchResult } from 'poki/src/features/search/SearchResult'
import { addToSearchHistory } from 'poki/src/features/search/searchHistorySlice'
import { tokenAddressOrNativeAddress } from 'poki/src/features/search/utils'
import { useDispatch } from 'react-redux'

export function useAddToSearchHistory(): { registerSearch: (currencyInfo: CurrencyInfo) => void } {
  const dispatch = useDispatch()

  const registerSearch = (currencyInfo: CurrencyInfo): void => {
    dispatch(
      addToSearchHistory({
        searchResult: currencyInfoToTokenSearchResult(currencyInfo),
      }),
    )
  }

  return { registerSearch }
}

function currencyInfoToTokenSearchResult(currencyInfo: CurrencyInfo): TokenSearchResult {
  const address = currencyInfo.currency.isToken
    ? currencyInfo.currency.address
    : getNativeAddress(currencyInfo.currency.chainId)

  return {
    type: SearchResultType.Token,
    chainId: currencyInfo.currency.chainId,
    address: tokenAddressOrNativeAddress(address, currencyInfo.currency.chainId),
    name: currencyInfo.currency.name ?? null,
    symbol: currencyInfo.currency.symbol ?? '',
    logoUrl: currencyInfo.logoUrl ?? null,
    safetyLevel: currencyInfo.safetyLevel ?? null,
    safetyInfo: currencyInfo.safetyInfo,
    feeData: currencyInfo.currency.isToken
      ? {
          buyFeeBps: currencyInfo.currency.buyFeeBps?.gt(0) ? currencyInfo.currency.buyFeeBps.toString() : undefined,
          sellFeeBps: currencyInfo.currency.sellFeeBps?.gt(0) ? currencyInfo.currency.sellFeeBps.toString() : undefined,
        }
      : null,
  }
}
