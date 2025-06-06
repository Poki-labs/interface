import { CurrencyLogo } from 'poki/src/components/CurrencyLogo/CurrencyLogo'
import { selectIsFirstUnichainBridgeSelection } from 'poki/src/features/behaviorHistory/selectors'
import { setIsFirstUnichainBridgeSelection } from 'poki/src/features/behaviorHistory/slice'
import { UniverseChainId } from 'poki/src/features/chains/types'
import { CurrencyInfo } from 'poki/src/features/dataApi/types'
import { FeatureFlags } from 'poki/src/features/gating/flags'
import { useFeatureFlag } from 'poki/src/features/gating/hooks'
import { TestIDType } from 'poki/src/test/fixtures/testIDs'
import { getContrastPassingTextColor } from 'poki/src/utils/colors'
import { getSymbolDisplayText } from 'poki/src/utils/currency'
import { ComponentProps, memo, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { Flex, Text, TouchableArea, getHoverCssFilter, isWeb, useIsDarkMode } from 'ui/src'
import { RotatableChevron } from 'ui/src/components/icons/RotatableChevron'
import { UnichainAnimatedText } from 'ui/src/components/text/UnichainAnimatedText'
import { iconSizes, spacing, validColor } from 'ui/src/theme'
import { isInterface, isMobileWeb } from 'utilities/src/platform'
import { ONE_SECOND_MS } from 'utilities/src/time/time'

interface SelectTokenButtonProps {
  onPress?: () => void
  selectedCurrencyInfo?: CurrencyInfo | null
  testID?: TestIDType
  tokenColor?: string
}

export const SelectTokenButton = memo(function _SelectTokenButton({
  selectedCurrencyInfo,
  onPress,
  testID,
  tokenColor,
}: SelectTokenButtonProps): JSX.Element {
  const { t } = useTranslation()
  const isDarkMode = useIsDarkMode()
  const dispatch = useDispatch()
  const isUnichainPromoActive = useFeatureFlag(FeatureFlags.UnichainPromo)
  const isUnichainEth =
    selectedCurrencyInfo?.currency.isNative && selectedCurrencyInfo?.currency.chainId === UniverseChainId.Unichain
  const isFirstUnichainBridgeSelection = useSelector(selectIsFirstUnichainBridgeSelection)
  const showUnichainPromoAnimation = isUnichainPromoActive && isUnichainEth && isFirstUnichainBridgeSelection

  useEffect(() => {
    if (showUnichainPromoAnimation) {
      // delay to prevent ux jank
      const delay = setTimeout(() => {
        dispatch(setIsFirstUnichainBridgeSelection(false))
      }, ONE_SECOND_MS * 2)
      return () => clearTimeout(delay)
    }
    return undefined
  }, [dispatch, showUnichainPromoAnimation])

  const validTokenColor = validColor(tokenColor)
  const hoverStyle: { backgroundColor: ComponentProps<typeof Flex>['backgroundColor'] } = useMemo(
    () => ({
      backgroundColor: selectedCurrencyInfo ? '$surface1Hovered' : validTokenColor ?? '$accent1Hovered',
      filter: validTokenColor ? getHoverCssFilter(isDarkMode) : undefined,
    }),
    [selectedCurrencyInfo, validTokenColor, isDarkMode],
  )

  const isCompact = !isInterface || isMobileWeb

  if (!onPress && selectedCurrencyInfo) {
    return (
      <Flex centered row gap="$spacing4" p="$spacing4" pr={isWeb ? undefined : '$spacing12'}>
        <CurrencyLogo currencyInfo={selectedCurrencyInfo} size={iconSizes.icon28} />
        <Text color="$neutral1" pl="$spacing4" testID={`${testID}-label`} variant="buttonLabel1">
          {getSymbolDisplayText(selectedCurrencyInfo.currency.symbol)}
        </Text>
      </Flex>
    )
  }

  const textColor = selectedCurrencyInfo
    ? '$neutral1'
    : tokenColor
      ? getContrastPassingTextColor(tokenColor) ?? '$white'
      : '$white'
  const chevronColor = selectedCurrencyInfo ? '$neutral2' : textColor

  return (
    <TouchableArea
      backgroundColor={selectedCurrencyInfo ? '$surface1' : validTokenColor ?? '$accent1'}
      borderRadius="$roundedFull"
      testID={testID}
      borderColor="$surface3Solid"
      borderWidth="$spacing1"
      shadowColor="$surface3"
      shadowRadius={10}
      shadowOpacity={0.04}
      scaleTo={0.98}
      hoverable={!!selectedCurrencyInfo}
      hoverStyle={hoverStyle}
      onPress={onPress}
    >
      <Flex centered row gap="$spacing6" px="$spacing12" height="$spacing36">
        {selectedCurrencyInfo && (
          <Flex ml={-spacing.spacing8}>
            <CurrencyLogo currencyInfo={selectedCurrencyInfo} size={iconSizes.icon28} />
          </Flex>
        )}
        <UnichainAnimatedText
          delayMs={800}
          enabled={!!showUnichainPromoAnimation}
          color={textColor}
          testID={`${testID}-label`}
          variant="buttonLabel2"
        >
          {selectedCurrencyInfo
            ? getSymbolDisplayText(selectedCurrencyInfo.currency.symbol)
            : t('tokens.selector.button.choose')}
        </UnichainAnimatedText>
        {!isCompact && (
          <RotatableChevron color={chevronColor} direction="down" height="$spacing24" mx={-spacing.spacing2} />
        )}
      </Flex>
    </TouchableArea>
  )
})
