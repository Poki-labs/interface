import { ALL_NETWORKS_ARG } from 'poki/src/data/rest/base'
import { tokenRankingsStatToCurrencyInfo, useTokenRankingsQuery } from 'poki/src/data/rest/tokenRankings'
import { CustomRankingType } from 'poki/src/data/types'
import { UniverseChainId } from 'poki/src/features/chains/types'
import { CurrencyInfo } from 'poki/src/features/dataApi/types'
import { FeatureFlags } from 'poki/src/features/gating/flags'
import { useFeatureFlag } from 'poki/src/features/gating/hooks'
import { useMemo } from 'react'

export function useTrendingTokensCurrencyInfos(chainFilter: Maybe<UniverseChainId>): {
  data: CurrencyInfo[]
  error: Error
  refetch: () => void
  loading: boolean
} {
  const isTokenSelectorTrendingTokensEnabled = useFeatureFlag(FeatureFlags.TokenSelectorTrendingTokens)

  const { data, isLoading, error, refetch, isFetching } = useTokenRankingsQuery(
    {
      chainId: chainFilter?.toString() ?? ALL_NETWORKS_ARG,
    },
    isTokenSelectorTrendingTokensEnabled,
  )

  const trendingTokens = data?.tokenRankings?.[CustomRankingType.Trending]?.tokens
  const formattedTokens = useMemo(
    () => trendingTokens?.map(tokenRankingsStatToCurrencyInfo).filter((t): t is CurrencyInfo => Boolean(t)) ?? [],
    [trendingTokens],
  )

  return { data: formattedTokens, loading: isLoading || isFetching, error: new Error(error?.message), refetch }
}
