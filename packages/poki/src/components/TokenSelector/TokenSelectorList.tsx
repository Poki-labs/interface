import { BaseCard } from 'poki/src/components/BaseCard/BaseCard'
import { ITEM_SECTION_HEADER_ROW_HEIGHT } from 'poki/src/components/TokenSelector/constants'
import { TokenOptionItem } from 'poki/src/components/TokenSelector/items/TokenOptionItem'
import { SectionFooter, TokenSectionFooterProps } from 'poki/src/components/TokenSelector/items/TokenSectionFooter'
import { SectionHeader, TokenSectionHeaderProps } from 'poki/src/components/TokenSelector/items/TokenSectionHeader'
import { HorizontalTokenList } from 'poki/src/components/TokenSelector/lists/HorizontalTokenList/HorizontalTokenList'
import {
  TokenSectionBaseList,
  TokenSectionBaseListRef,
} from 'poki/src/components/TokenSelector/lists/TokenSectionBaseList/TokenSectionBaseList'
import { OnSelectCurrency, TokenSection } from 'poki/src/components/TokenSelector/types'
import { useBottomSheetFocusHook } from 'poki/src/components/modals/hooks'
import { useEnabledChains } from 'poki/src/features/chains/hooks/useEnabledChains'
import { UniverseChainId } from 'poki/src/features/chains/types'
import { useLocalizationContext } from 'poki/src/features/language/LocalizationContext'
import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AnimateTransition, Flex, Loader, Skeleton, Text } from 'ui/src'
import { useIsExtraLargeScreen } from 'ui/src/hooks/useDeviceDimensions'
import { fonts } from 'ui/src/theme'
// import { useDismissedTokenWarnings } from 'poki/src/features/tokens/slice/hooks'
import { useUnichainTooltipVisibility } from 'poki/src/features/unichain/hooks/useUnichainTooltipVisibility'
import { CurrencyId } from 'poki/src/types/currency'
import { IcExplorerTokenDetail } from 'poki/src/types/ic-explorer'
import { NumberType } from 'utilities/src/format/types'
import { DDRumManualTiming } from 'utilities/src/logger/datadog/datadogEvents'
import { usePerformanceLogger } from 'utilities/src/logger/usePerformanceLogger'
import { isInterface } from 'utilities/src/platform'

function isHorizontalListTokenItem(
  data: IcExplorerTokenDetail | IcExplorerTokenDetail[],
): data is IcExplorerTokenDetail[] {
  return Array.isArray(data)
}

const TokenOptionItemWrapper = memo(function _TokenOptionItemWrapper({
  tokenOption,
  onSelectCurrency,
  section,
  index,
  showWarnings,
  showTokenAddress,
  isKeyboardOpen,
  isTagToken,
}: {
  tokenOption: IcExplorerTokenDetail
  section: TokenSection
  index: number
  showWarnings: boolean
  showTokenAddress?: boolean
  isKeyboardOpen?: boolean
  onSelectCurrency: OnSelectCurrency
  isTagToken?: boolean
}): JSX.Element {
  const { convertFiatAmountFormatted, formatNumberOrString } = useLocalizationContext()
  const onPress = useCallback(
    () => onSelectCurrency(tokenOption, section, index),
    [index, onSelectCurrency, section, tokenOption],
  )

  const { isTestnetModeEnabled } = useEnabledChains()

  // const { tokenWarningDismissed } = useDismissedTokenWarnings(tokenOption.currencyInfo.currency)

  // const tokenBalance = formatNumberOrString({
  //   value: tokenOption.quantity,
  //   type: NumberType.TokenTx,
  // })
  const tokenBalance = formatNumberOrString({
    value: 1000,
    type: NumberType.TokenTx,
  })

  // const fiatBalance = convertFiatAmountFormatted(tokenOption.balanceUSD, NumberType.FiatTokenPrice)

  const fiatBalance = convertFiatAmountFormatted(1.234, NumberType.FiatTokenPrice)

  const title = isTestnetModeEnabled ? tokenBalance : fiatBalance
  const subtitle = isTestnetModeEnabled ? undefined : tokenBalance

  return (
    <TokenOptionItem
      balance={title}
      isKeyboardOpen={isKeyboardOpen}
      option={tokenOption}
      // quantity={tokenOption.quantity}
      quantity={0}
      quantityFormatted={subtitle}
      showTokenAddress={showTokenAddress}
      showWarnings={showWarnings}
      tokenWarningDismissed={false}
      onPress={onPress}
      isTagToken={isTagToken}
    />
  )
})

function EmptyResults(): JSX.Element {
  const { t } = useTranslation()
  return (
    <Flex>
      <Text color="$neutral3" mt="$spacing16" textAlign="center" variant="subheading2">
        {t('common.noResults')}
      </Text>
    </Flex>
  )
}

interface TokenSelectorListProps {
  onSelectCurrency: OnSelectCurrency
  sections?: TokenSection[]
  chainFilter?: UniverseChainId | null
  showTokenWarnings: boolean
  refetch?: () => void
  loading?: boolean
  hasError?: boolean
  emptyElement?: JSX.Element
  errorText?: string
  showTokenAddress?: boolean
  isKeyboardOpen?: boolean
  isTagToken?: boolean
}

function _TokenSelectorList({
  onSelectCurrency,
  sections,
  chainFilter,
  showTokenWarnings,
  isKeyboardOpen,
  refetch,
  loading,
  hasError,
  emptyElement,
  errorText,
  showTokenAddress,
  isTagToken,
}: TokenSelectorListProps): JSX.Element {
  const { t } = useTranslation()
  const sectionListRef = useRef<TokenSectionBaseListRef>()
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const { shouldShowUnichainBridgingTooltip } = useUnichainTooltipVisibility()
  const isExtraLargeScreen = useIsExtraLargeScreen()
  const isXLInterface = isInterface && isExtraLargeScreen
  const shouldRenderUnichainInlineBridgingTooltip =
    shouldShowUnichainBridgingTooltip && !isXLInterface && chainFilter === UniverseChainId.Unichain

  usePerformanceLogger(DDRumManualTiming.TokenSelectorListRender, [chainFilter])

  useEffect(() => {
    if (sections?.length) {
      sectionListRef.current?.scrollToLocation({
        itemIndex: 0,
        sectionIndex: 0,
        animated: true,
      })
    }
  }, [chainFilter, sections?.length])

  const handleExpand = useCallback(
    (item: IcExplorerTokenDetail | IcExplorerTokenDetail[]) => {
      setExpandedItems((prev) => [...prev, key(item)])
    },
    [setExpandedItems],
  )

  const isExpandedItem = useCallback(
    (item: IcExplorerTokenDetail[]) => {
      return expandedItems.includes(key(item))
    },
    [expandedItems],
  )

  // Note: the typing for this comes from the web TokenSectionBaseList.tsx's renderItem
  const renderItem = useCallback(
    ({
      item,
      section,
      index,
    }: {
      item: IcExplorerTokenDetail | IcExplorerTokenDetail[]
      section: TokenSection
      index: number
    }) => {
      if (isHorizontalListTokenItem(item)) {
        return (
          <HorizontalTokenList
            tokens={item}
            section={section}
            index={index}
            expanded={isExpandedItem(item)}
            onSelectCurrency={onSelectCurrency}
            onExpand={() => handleExpand(item)}
          />
        )
      }

      return (
        <TokenOptionItemWrapper
          index={index}
          isKeyboardOpen={isKeyboardOpen}
          section={section}
          showTokenAddress={showTokenAddress}
          showWarnings={showTokenWarnings}
          tokenOption={item}
          onSelectCurrency={onSelectCurrency}
          isTagToken={isTagToken}
        />
      )
    },
    [onSelectCurrency, showTokenAddress, showTokenWarnings, isKeyboardOpen, handleExpand, isExpandedItem],
  )

  const renderSectionHeader = useCallback(
    ({ section }: { section: TokenSectionHeaderProps }): JSX.Element => (
      <SectionHeader
        rightElement={section.rightElement}
        endElement={section.endElement}
        sectionKey={section.sectionKey}
        name={section.name}
        chainId={chainFilter}
      />
    ),
    [chainFilter],
  )

  const renderSectionFooter = useCallback(
    ({ section }: { section: TokenSectionFooterProps }): JSX.Element => (
      <SectionFooter
        rightElement={section.rightElement}
        sectionKey={section.sectionKey}
        name={section.name}
        chainId={chainFilter}
      />
    ),
    [chainFilter],
  )

  if (hasError) {
    return (
      <>
        <Flex grow justifyContent="center">
          <BaseCard.ErrorState
            retryButtonLabel={t('common.button.retry')}
            title={errorText ?? t('tokens.selector.error.load')}
            onRetry={refetch}
          />
        </Flex>
        {/*
          This is needed to position error message roughly in the center of
          the sheet initially when modal is opened to 65% only
        */}
        <Flex grow />
      </>
    )
  }

  return (
    <AnimateTransition animationType="fade" currentIndex={(!sections || !sections.length) && loading ? 0 : 1}>
      <Flex grow px="$spacing16">
        <Flex height={ITEM_SECTION_HEADER_ROW_HEIGHT} justifyContent="center" py="$spacing16" width={80}>
          <Skeleton>
            <Loader.Box height={fonts.subheading2.lineHeight} />
          </Skeleton>
        </Flex>
        <Loader.Token gap="$none" repeat={15} />
      </Flex>
      <TokenSectionBaseList
        ListEmptyComponent={emptyElement || <EmptyResults />}
        focusHook={useBottomSheetFocusHook}
        keyExtractor={key}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        renderSectionFooter={shouldRenderUnichainInlineBridgingTooltip ? renderSectionFooter : undefined}
        sectionListRef={sectionListRef}
        sections={sections ?? []}
        expandedItems={expandedItems}
      />
    </AnimateTransition>
  )
}

function key(item: IcExplorerTokenDetail | IcExplorerTokenDetail[]): CurrencyId {
  if (isHorizontalListTokenItem(item)) {
    return item.map((token) => token.ledgerId).join('_')
  }

  return item.ledgerId
}

export const TokenSelectorList = memo(_TokenSelectorList)
