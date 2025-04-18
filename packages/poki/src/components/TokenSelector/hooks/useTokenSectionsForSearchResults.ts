import { usePortfolioBalancesForAddressById } from 'poki/src/components/TokenSelector/hooks/usePortfolioBalancesForAddressById'
import { usePortfolioTokenOptions } from 'poki/src/components/TokenSelector/hooks/usePortfolioTokenOptions'
import { TokenOptionSection, TokenSection } from 'poki/src/components/TokenSelector/types'
import {
  formatSearchResults,
  mergeSearchResultsWithBridgingTokens,
  useTokenOptionsSection,
} from 'poki/src/components/TokenSelector/utils'
import { GqlResult } from 'poki/src/data/types'
import { TradeableAsset } from 'poki/src/entities/assets'
import { useBridgingTokensOptions } from 'poki/src/features/bridging/hooks/tokens'
import { UniverseChainId } from 'poki/src/features/chains/types'
import { getChainLabel } from 'poki/src/features/chains/utils'
import { useSearchTokens } from 'poki/src/features/dataApi/searchTokens'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export function useTokenSectionsForSearchResults(
  address: string | undefined,
  chainFilter: UniverseChainId | null,
  searchFilter: string | null,
  isBalancesOnlySearch: boolean,
  input: TradeableAsset | undefined,
): GqlResult<TokenSection[]> {
  const { t } = useTranslation()

  const {
    data: portfolioBalancesById,
    error: portfolioBalancesByIdError,
    refetch: refetchPortfolioBalances,
    loading: portfolioBalancesByIdLoading,
  } = usePortfolioBalancesForAddressById(address)

  const {
    data: portfolioTokenOptions,
    error: portfolioTokenOptionsError,
    refetch: refetchPortfolioTokenOptions,
    loading: portfolioTokenOptionsLoading,
  } = usePortfolioTokenOptions(address, chainFilter, searchFilter ?? undefined)

  // Bridging tokens are only shown if input is provided
  const {
    data: bridgingTokenOptions,
    error: bridgingTokenOptionsError,
    refetch: refetchBridgingTokenOptions,
    loading: bridgingTokenOptionsLoading,
  } = useBridgingTokensOptions({ input, walletAddress: address, chainFilter })

  // Only call search endpoint if isBalancesOnlySearch is false
  const {
    data: searchResultCurrencies,
    error: searchTokensError,
    refetch: refetchSearchTokens,
    loading: searchTokensLoading,
  } = useSearchTokens(searchFilter, chainFilter, /*skip*/ isBalancesOnlySearch)

  const searchResults = useMemo(() => {
    return formatSearchResults(searchResultCurrencies, portfolioBalancesById, searchFilter)
  }, [searchResultCurrencies, portfolioBalancesById, searchFilter])

  const loading =
    portfolioTokenOptionsLoading ||
    portfolioBalancesByIdLoading ||
    (!isBalancesOnlySearch && searchTokensLoading) ||
    bridgingTokenOptionsLoading

  const searchResultsSections = useTokenOptionsSection({
    sectionKey: TokenOptionSection.SearchResults,
    // Use local search when only searching balances
    tokenOptions: isBalancesOnlySearch ? portfolioTokenOptions : searchResults,
  })

  // If there are bridging options, we need to extract them from the search results and then prepend them as a new section above.
  // The remaining non-bridging search results will be shown in a section with a different name
  const networkName = chainFilter ? getChainLabel(chainFilter) : undefined
  const searchResultsSectionHeader = networkName
    ? t('tokens.selector.section.otherSearchResults', { network: networkName })
    : undefined
  const sections = mergeSearchResultsWithBridgingTokens(
    searchResultsSections,
    bridgingTokenOptions,
    searchResultsSectionHeader,
  )

  const error =
    (!bridgingTokenOptions && bridgingTokenOptionsError) ||
    (!portfolioBalancesById && portfolioBalancesByIdError) ||
    (!portfolioTokenOptions && portfolioTokenOptionsError) ||
    (!isBalancesOnlySearch && !searchResults && searchTokensError)

  const refetchAll = useCallback(() => {
    refetchPortfolioBalances?.()
    refetchSearchTokens?.()
    refetchPortfolioTokenOptions?.()
    refetchBridgingTokenOptions?.()
  }, [refetchBridgingTokenOptions, refetchPortfolioBalances, refetchPortfolioTokenOptions, refetchSearchTokens])

  return useMemo(
    () => ({
      data: sections,
      loading,
      error: error || undefined,
      refetch: refetchAll,
    }),
    [error, loading, refetchAll, sections],
  )
}
