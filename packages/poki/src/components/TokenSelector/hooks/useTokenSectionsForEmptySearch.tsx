import { MAX_DEFAULT_POPULAR_TOKEN_RESULTS_AMOUNT } from 'poki/src/components/TokenSelector/constants'
import { usePopularTokensOptions } from 'poki/src/components/TokenSelector/hooks/usePopularTokensOptions'
import { useRecentlySearchedTokens } from 'poki/src/components/TokenSelector/hooks/useRecentlySearchedTokens'
import { TokenOptionSection, TokenSection, TokenSectionsHookProps } from 'poki/src/components/TokenSelector/types'
import { useTokenOptionsSection } from 'poki/src/components/TokenSelector/utils'
import { GqlResult } from 'poki/src/data/types'
import { clearSearchHistory } from 'poki/src/features/search/searchHistorySlice'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { Text, TouchableArea } from 'ui/src'

function ClearAll({ onPress }: { onPress: () => void }): JSX.Element {
  const { t } = useTranslation()
  return (
    <TouchableArea onPress={onPress}>
      <Text color="$accent1" variant="buttonLabel3">
        {t('tokens.selector.button.clear')}
      </Text>
    </TouchableArea>
  )
}

export function useTokenSectionsForEmptySearch({
  activeAccountAddress,
  chainFilter,
}: Omit<TokenSectionsHookProps, 'input' | 'isKeyboardOpen'>): GqlResult<TokenSection[]> {
  const dispatch = useDispatch()

  const { data: popularTokenOptions, loading } = usePopularTokensOptions(activeAccountAddress, chainFilter)

  const recentlySearchedTokenOptions = useRecentlySearchedTokens(chainFilter)

  // it's a dependency of useMemo => useCallback
  const onPressClearSearchHistory = useCallback((): void => {
    dispatch(clearSearchHistory())
  }, [dispatch])

  const recentSection = useTokenOptionsSection({
    sectionKey: TokenOptionSection.RecentTokens,
    tokenOptions: recentlySearchedTokenOptions,
    endElement: <ClearAll onPress={onPressClearSearchHistory} />,
  })

  const popularSection = useTokenOptionsSection({
    // TODO(WEB-5917): Rename to trendingTokens once feature flag is fully on
    sectionKey: TokenOptionSection.PopularTokens,
    tokenOptions: popularTokenOptions?.slice(0, MAX_DEFAULT_POPULAR_TOKEN_RESULTS_AMOUNT),
  })
  const sections = useMemo(() => [...(recentSection ?? []), ...(popularSection ?? [])], [popularSection, recentSection])

  return useMemo(
    () => ({
      data: sections,
      loading,
    }),
    [loading, sections],
  )
}
