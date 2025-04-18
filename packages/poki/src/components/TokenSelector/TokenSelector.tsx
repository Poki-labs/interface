import { InterfaceEventName, InterfaceModalName } from 'analytics-events/src/index'
import { hasStringAsync } from 'expo-clipboard'
import { useFilterCallbacks } from 'poki/src/components/TokenSelector/hooks/useFilterCallbacks'
import { TokenSelectorSendList } from 'poki/src/components/TokenSelector/lists/TokenSelectorSendList'
import { TokenOptionSection, TokenSection, TokenSelectorFlow } from 'poki/src/components/TokenSelector/types'
import PasteButton from 'poki/src/components/buttons/PasteButton'
import { useBottomSheetContext } from 'poki/src/components/modals/BottomSheetContext'
import { Modal } from 'poki/src/components/modals/Modal'
import { usePokiContext } from 'poki/src/contexts/PokiContext'
import { TradeableAsset } from 'poki/src/entities/assets'
import { useEnabledChains } from 'poki/src/features/chains/hooks/useEnabledChains'
import { UniverseChainId } from 'poki/src/features/chains/types'
import { SearchContext } from 'poki/src/features/search/SearchContext'
import { SearchTextInput } from 'poki/src/features/search/SearchTextInput'
import Trace from 'poki/src/features/telemetry/Trace'
import { ElementName, ModalName, SectionName } from 'poki/src/features/telemetry/constants'
import { useUnichainTooltipVisibility } from 'poki/src/features/unichain/hooks/useUnichainTooltipVisibility'
import useIsKeyboardOpen from 'poki/src/hooks/useIsKeyboardOpen'
import { CurrencyField } from 'poki/src/types/currency'
import { IcExplorerTokenDetail } from 'poki/src/types/ic-explorer'
import { getClipboard } from 'poki/src/utils/clipboard'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Flex, ModalCloseIcon, Text, isWeb, useMedia, useScrollbarStyles, useSporeColors } from 'ui/src'
import { InfoCircleFilled } from 'ui/src/components/icons/InfoCircleFilled'
import { dismissNativeKeyboard } from 'utilities/src/device/keyboard'
import { isInterface, isMobileApp, isMobileWeb } from 'utilities/src/platform'
import { useTrace } from 'utilities/src/telemetry/trace/TraceContext'
import { useDebounce } from 'utilities/src/time/timing'

export const TOKEN_SELECTOR_WEB_MAX_WIDTH = 400
export const TOKEN_SELECTOR_WEB_MAX_HEIGHT = 700

export enum TokenSelectorVariation {
  // used for Send flow, only show currencies with a balance
  BalancesOnly = 'balances-only',
  // Swap input and output sections specced in 'Multichain UX: Token Selector and Swap' doc on Notion
  SwapInput = 'swap-input', // balances, recent searches, favorites, popular
  SwapOutput = 'swap-output', // suggested bases, balances, recent searches, favorites, popular
}

export interface TokenSelectorProps {
  variation: TokenSelectorVariation
  isModalOpen: boolean
  currencyField: CurrencyField
  flow: TokenSelectorFlow
  activeAccountAddress?: string
  chainId?: UniverseChainId
  chainIds?: UniverseChainId[]
  input?: TradeableAsset
  isSurfaceReady?: boolean
  isLimits?: boolean
  onClose: () => void
  onSelectChain?: (chainId: UniverseChainId | null) => void
  onSelectCurrency?: (currency: IcExplorerTokenDetail, currencyField: CurrencyField, isBridgePair: boolean) => void
  title?: string
}

export function TokenSelectorContent({
  currencyField,
  flow,
  variation,
  input,
  activeAccountAddress,
  chainId,
  isSurfaceReady = true,
  isLimits,
  onClose,
  onSelectCurrency,
  title,
}: Omit<TokenSelectorProps, 'isModalOpen'>): JSX.Element {
  const { onChangeText, searchFilter, parsedSearchFilter } = useFilterCallbacks(chainId ?? null, flow)
  const debouncedSearchFilter = useDebounce(searchFilter)
  const debouncedParsedSearchFilter = useDebounce(parsedSearchFilter)
  const scrollbarStyles = useScrollbarStyles()
  const isKeyboardOpen = useIsKeyboardOpen()
  const { navigateToBuyOrReceiveWithEmptyWallet } = usePokiContext()
  const { shouldShowUnichainNetworkSelectorTooltip } = useUnichainTooltipVisibility()

  const media = useMedia()
  const isSmallScreen = (media.sm && isInterface) || isMobileApp || isMobileWeb

  const [hasClipboardString, setHasClipboardString] = useState(false)

  const { chains: enabledChains, isTestnetModeEnabled } = useEnabledChains()

  // Check if user clipboard has any text to show paste button
  useEffect(() => {
    async function checkClipboard(): Promise<void> {
      const result = await hasStringAsync()
      setHasClipboardString(result)
    }

    // Browser doesn't have permissions to access clipboard by default
    // so it will prompt the user to allow clipboard access which is
    // quite jarring and unnecessary.
    if (isInterface) {
      return
    }
    checkClipboard().catch(() => undefined)
  }, [])

  const { t } = useTranslation()
  const { page } = useTrace()

  // Log currency field only for swap as for send it's always input
  const currencyFieldName =
    flow === TokenSelectorFlow.Swap
      ? currencyField === CurrencyField.INPUT
        ? ElementName.TokenInputSelector
        : ElementName.TokenOutputSelector
      : undefined

  const onSelectCurrencyCallback = useCallback(
    (currencyInfo: IcExplorerTokenDetail, section: TokenSection, index: number): void => {
      const searchContext: SearchContext = {
        category: section.sectionKey,
        query: debouncedSearchFilter ?? undefined,
        position: index + 1,
        suggestionCount: section.data.length,
      }

      if (flow === TokenSelectorFlow.Tag) return

      const isBridgePair = section.sectionKey === TokenOptionSection.BridgingTokens
      if (onSelectCurrency) onSelectCurrency(currencyInfo, currencyField, isBridgePair)
    },
    [flow, page, currencyField, onSelectCurrency, debouncedSearchFilter],
  )

  const handlePaste = async (): Promise<void> => {
    const clipboardContent = await getClipboard()
    if (clipboardContent) {
      onChangeText(clipboardContent)
    }
  }

  const [searchInFocus, setSearchInFocus] = useState(false)

  const onSendEmptyActionPress = useCallback(() => {
    onClose()
    navigateToBuyOrReceiveWithEmptyWallet?.()
  }, [navigateToBuyOrReceiveWithEmptyWallet, onClose])

  function onCancel(): void {
    setSearchInFocus(false)
  }
  function onFocus(): void {
    if (!isWeb) {
      setSearchInFocus(true)
    }
  }

  const shouldAutoFocusSearch = isWeb && !media.sm

  const tokenSelector = useMemo(() => {
    return (
      <TokenSelectorSendList
        activeAccountAddress={activeAccountAddress}
        isKeyboardOpen={isKeyboardOpen}
        onEmptyActionPress={onSendEmptyActionPress}
        onSelectCurrency={onSelectCurrencyCallback}
        filter={debouncedSearchFilter}
        isTagToken={flow === TokenSelectorFlow.Tag}
      />
    )
  }, [
    searchInFocus,
    searchFilter,
    isTestnetModeEnabled,
    variation,
    isKeyboardOpen,
    onSelectCurrencyCallback,
    activeAccountAddress,
    debouncedParsedSearchFilter,
    debouncedSearchFilter,
    input,
    onSendEmptyActionPress,
  ])

  return (
    <Trace
      logImpression={isInterface} // TODO(WEB-5161): Deduplicate shared vs interface-only trace event
      eventOnTrigger={InterfaceEventName.TOKEN_SELECTOR_OPENED}
      modal={InterfaceModalName.TOKEN_SELECTOR}
    >
      <Trace logImpression element={currencyFieldName} section={SectionName.TokenSelector}>
        <Flex grow gap="$spacing8" style={scrollbarStyles}>
          {!isSmallScreen && (
            <Flex row justifyContent="space-between" pt="$spacing16" px="$spacing16">
              <Text variant="subheading1">{title ?? t('common.selectToken.label')}</Text>
              <ModalCloseIcon onClose={onClose} />
            </Flex>
          )}
          <Flex px="$spacing16" py="$spacing4">
            <SearchTextInput
              autoFocus={shouldAutoFocusSearch}
              backgroundColor="$surface2"
              endAdornment={
                <Flex row alignItems="center">
                  {hasClipboardString && !shouldShowUnichainNetworkSelectorTooltip && (
                    <PasteButton inline textVariant="buttonLabel3" onPress={handlePaste} />
                  )}
                </Flex>
              }
              placeholder={t('tokens.selector.search.placeholder')}
              px="$spacing16"
              py="$none"
              value={searchFilter ?? ''}
              onCancel={isWeb ? undefined : onCancel}
              onChangeText={onChangeText}
              onFocus={onFocus}
            />
          </Flex>
          {isLimits && (
            <Flex
              row
              backgroundColor="$surface2"
              borderRadius="$rounded12"
              gap="$spacing12"
              mx="$spacing8"
              p="$spacing12"
            >
              <InfoCircleFilled color="$neutral2" size="$icon.20" />
              <Text variant="body3">{t('limits.form.disclaimer.mainnet.short')}</Text>
            </Flex>
          )}
          {isSurfaceReady && <Flex grow>{tokenSelector}</Flex>}
        </Flex>
      </Trace>
    </Trace>
  )
}

function TokenSelectorModalContent(props: TokenSelectorProps): JSX.Element {
  const { isModalOpen } = props
  const { isSheetReady } = useBottomSheetContext()

  useEffect(() => {
    if (isModalOpen) {
      // Dismiss native keyboard when opening modal in case it was opened by the current screen.
      dismissNativeKeyboard()
    }
  }, [isModalOpen])

  return <TokenSelectorContent {...props} isSurfaceReady={isSheetReady} />
}

function _TokenSelectorModal(props: TokenSelectorProps): JSX.Element {
  const colors = useSporeColors()
  const { isModalOpen, onClose } = props

  return (
    <Modal
      extendOnKeyboardVisible
      fullScreen
      hideKeyboardOnDismiss
      hideKeyboardOnSwipeDown
      renderBehindBottomInset
      backgroundColor={colors.surface1.val}
      isModalOpen={isModalOpen}
      maxWidth={isWeb ? TOKEN_SELECTOR_WEB_MAX_WIDTH : undefined}
      maxHeight={isInterface ? TOKEN_SELECTOR_WEB_MAX_HEIGHT : undefined}
      name={ModalName.TokenSelector}
      padding="$none"
      snapPoints={['65%', '100%']}
      height={isInterface ? '100vh' : undefined}
      onClose={onClose}
    >
      <TokenSelectorModalContent {...props} />
    </Modal>
  )
}

export const TokenSelectorModal = memo(_TokenSelectorModal)
