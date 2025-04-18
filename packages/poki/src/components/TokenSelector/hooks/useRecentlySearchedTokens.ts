import { MAX_RECENT_SEARCH_RESULTS } from 'poki/src/components/TokenSelector/constants'
import { currencyInfosToTokenOptions } from 'poki/src/components/TokenSelector/hooks/useCurrencyInfosToTokenOptions'
import { TokenOption } from 'poki/src/components/TokenSelector/types'
import { UniverseChainId } from 'poki/src/features/chains/types'
import { CurrencyInfo } from 'poki/src/features/dataApi/types'
import { SearchResultType, TokenSearchResult } from 'poki/src/features/search/SearchResult'
import { selectSearchHistory } from 'poki/src/features/search/selectSearchHistory'
import { useCurrencyInfos } from 'poki/src/features/tokens/useCurrencyInfo'
import { buildCurrencyId, buildNativeCurrencyId } from 'poki/src/utils/currencyId'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'

export function useRecentlySearchedTokens(chainFilter: UniverseChainId | null): TokenOption[] | undefined {
  const searchHistory = useSelector(selectSearchHistory)

  const searchHistoryCurrencyInfos = useSearchHistoryToCurrencyInfos(
    searchHistory
      .filter((searchResult): searchResult is TokenSearchResult => searchResult.type === SearchResultType.Token)
      .filter((searchResult) => (chainFilter ? searchResult.chainId === chainFilter : true))
      .slice(0, MAX_RECENT_SEARCH_RESULTS),
  )

  return useMemo(() => {
    return currencyInfosToTokenOptions(searchHistoryCurrencyInfos)
  }, [searchHistoryCurrencyInfos])
}

// TODO(WEB-5131): Clean up searchHistory slice so that we only save chainId & address to redux
function useSearchHistoryToCurrencyInfos(searchHistory: TokenSearchResult[]): Maybe<CurrencyInfo>[] {
  const currencyIds = searchHistory.map((searchResult) => {
    return searchResult.address
      ? buildCurrencyId(searchResult.chainId, searchResult.address)
      : buildNativeCurrencyId(searchResult.chainId)
  })

  return useCurrencyInfos(currencyIds)
}
