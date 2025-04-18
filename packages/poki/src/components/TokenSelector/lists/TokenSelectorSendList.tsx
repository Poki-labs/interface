import { BaseCard } from 'poki/src/components/BaseCard/BaseCard'
import { TokenSelectorList } from 'poki/src/components/TokenSelector/TokenSelectorList'
import { SectionHeader } from 'poki/src/components/TokenSelector/items/TokenSectionHeader'
import {
  OnSelectCurrency,
  TokenOptionSection,
  TokenSection,
  TokenSectionsHookProps,
} from 'poki/src/components/TokenSelector/types'
import { useTokensFromExplorer } from 'poki/src/features/tokens/useAllTokens'
import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Flex } from 'ui/src'

function EmptyList({ onEmptyActionPress }: { onEmptyActionPress?: () => void }): JSX.Element {
  const { t } = useTranslation()

  return (
    <Flex>
      <SectionHeader sectionKey={TokenOptionSection.YourTokens} />
      <Flex pt="$spacing16" px="$spacing16">
        <BaseCard.EmptyState
          buttonLabel={
            onEmptyActionPress ? t('tokens.selector.empty.buy.title') : t('tokens.selector.empty.receive.title')
          }
          description={t('tokens.selector.empty.buy.message')}
          title={t('tokens.selector.empty.title')}
          onPress={onEmptyActionPress}
        />
      </Flex>
    </Flex>
  )
}

function _TokenSelectorSendList({
  isKeyboardOpen,
  onSelectCurrency,
  onEmptyActionPress,
  filter,
  isTagToken,
}: TokenSectionsHookProps & {
  onSelectCurrency: OnSelectCurrency
  onEmptyActionPress: () => void
  filter: string | null
  isTagToken?: boolean
}): JSX.Element {
  const { result: allTokens, loading } = useTokensFromExplorer()

  const emptyElement = useMemo(() => <EmptyList onEmptyActionPress={onEmptyActionPress} />, [onEmptyActionPress])

  const filteredSections = useMemo(() => {
    if (!allTokens) return []

    return (
      !filter
        ? [
            {
              sectionKey: TokenOptionSection.YourTokens,
              data: allTokens,
            },
          ]
        : [
            {
              sectionKey: TokenOptionSection.YourTokens,
              data: allTokens.filter((token) => {
                if (!token.name || !token.ledgerId || !token.symbol) {
                  return false
                }

                return (
                  token.name.toLowerCase().includes(filter.toLowerCase()) ||
                  token.ledgerId.toLowerCase().includes(filter.toLowerCase()) ||
                  token.symbol.toLowerCase().includes(filter.toLowerCase())
                )
              }),
            },
          ]
    ) as TokenSection[]
  }, [allTokens, filter])

  return (
    <TokenSelectorList
      showTokenAddress
      emptyElement={emptyElement}
      isKeyboardOpen={isKeyboardOpen}
      loading={loading}
      sections={filteredSections}
      showTokenWarnings={false}
      onSelectCurrency={onSelectCurrency}
      isTagToken={isTagToken}
    />
  )
}

export const TokenSelectorSendList = memo(_TokenSelectorSendList)
