import { TokenSelectorFlow } from 'poki/src/components/TokenSelector/types'
import { useCallback, useEffect, useState } from 'react'
// import { useEnabledChains } from 'poki/src/features/chains/hooks/useEnabledChains'
import { UniverseChainId } from 'poki/src/features/chains/types'

export function useFilterCallbacks(
  chainId: UniverseChainId | null,
  flow: TokenSelectorFlow,
): {
  searchFilter: string | null
  parsedSearchFilter: string | null
  onClearSearchFilter: () => void
  onChangeText: (newSearchFilter: string) => void
} {
  const [searchFilter, setSearchFilter] = useState<string | null>(null)
  const [parsedSearchFilter, setParsedSearchFilter] = useState<string | null>(null)

  useEffect(() => {
    setParsedSearchFilter(searchFilter)
  }, [searchFilter])

  // const onChangeChainFilter = useCallback(
  //   (newChainFilter: typeof chainFilter) => {
  //     setChainFilter(newChainFilter)
  //     sendAnalyticsEvent(WalletEventName.NetworkFilterSelected, {
  //       chain: newChainFilter ?? 'All',
  //       modal: flowToModalName(flow),
  //     })
  //   },
  //   [flow],
  // )

  const onClearSearchFilter = useCallback(() => {
    setSearchFilter(null)
  }, [])

  const onChangeText = useCallback((newSearchFilter: string) => setSearchFilter(newSearchFilter), [setSearchFilter])

  return {
    // chainFilter,
    searchFilter,
    parsedSearchFilter,
    // onChangeChainFilter,
    onClearSearchFilter,
    onChangeText,
  }
}
