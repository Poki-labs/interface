import { TokenSelectorList } from 'poki/src/components/TokenSelector/TokenSelectorList'
import { useTokenSectionsForEmptySearch } from 'poki/src/components/TokenSelector/hooks/useTokenSectionsForEmptySearch'
import { OnSelectCurrency } from 'poki/src/components/TokenSelector/types'
import { UniverseChainId } from 'poki/src/features/chains/types'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'

function _TokenSelectorEmptySearchList({
  activeAccountAddress,
  chainFilter,
  onSelectCurrency,
}: {
  activeAccountAddress?: string
  onSelectCurrency: OnSelectCurrency
  chainFilter: UniverseChainId | null
}): JSX.Element {
  const { t } = useTranslation()

  const {
    data: sections,
    loading,
    error,
    refetch,
  } = useTokenSectionsForEmptySearch({
    activeAccountAddress,
    chainFilter,
  })

  return (
    <TokenSelectorList
      showTokenAddress
      errorText={t('token.selector.search.error')}
      hasError={Boolean(error)}
      loading={loading}
      refetch={refetch}
      sections={sections}
      showTokenWarnings={true}
      onSelectCurrency={onSelectCurrency}
    />
  )
}

export const TokenSelectorEmptySearchList = memo(_TokenSelectorEmptySearchList)
