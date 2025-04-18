import { TokenLogo } from 'poki/src/components/CurrencyLogo/TokenLogo'
import { TokenOptionItemWrapper } from 'poki/src/components/TokenSelector/items/TokenOptionItemWrapper'
import { setHasSeenBridgingTooltip } from 'poki/src/features/behaviorHistory/slice'
import React, { useCallback, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Flex, Text, TouchableArea, useSporeColors } from 'ui/src'
import Check from 'ui/src/assets/icons/check.svg'
import { UnichainAnimatedText } from 'ui/src/components/text/UnichainAnimatedText'
import { iconSizes } from 'ui/src/theme'
// import TokenWarningModal from 'poki/src/features/tokens/TokenWarningModal'
import { DEFAULT_TAG_TOKENS } from 'poki/src/constants/tokens'
import { useAddTagTokens, useAllTagTokens, useDeleteTagTokens } from 'poki/src/features/tokens/slice/hooks'
import { useUnichainTooltipVisibility } from 'poki/src/features/unichain/hooks/useUnichainTooltipVisibility'
import { IcExplorerTokenDetail } from 'poki/src/types/ic-explorer'
import { getSymbolDisplayText } from 'poki/src/utils/currency'
import { getIcExplorerTokenLogo } from 'poki/src/utils/token-logo'
import { Switch } from 'ui/src'
import { shortenAddress } from 'utilities/src/addresses'
import { dismissNativeKeyboard } from 'utilities/src/device/keyboard'
import { isInterface } from 'utilities/src/platform'

interface OptionProps {
  option: IcExplorerTokenDetail
  showWarnings: boolean
  onPress: () => void
  showTokenAddress?: boolean
  tokenWarningDismissed: boolean
  quantity: number | null
  // TODO(WEB-4731): Remove isKeyboardOpen dependency
  isKeyboardOpen?: boolean
  // TODO(WEB-3643): Share localization context with WEB
  // (balance, quantityFormatted)
  balance: string
  quantityFormatted?: string
  isSelected?: boolean
  isTagToken?: boolean
}

function _TokenOptionItem({
  option,
  showWarnings,
  onPress,
  showTokenAddress,
  balance,
  quantity,
  quantityFormatted,
  isKeyboardOpen,
  isSelected,
  isTagToken,
}: OptionProps): JSX.Element {
  const currency = option

  const [showWarningModal, setShowWarningModal] = useState(false)
  const colors = useSporeColors()
  const dispatch = useDispatch()

  // const severity = getTokenWarningSeverity(currencyInfo)
  // const isBlocked = severity === WarningSeverity.Blocked || safetyLevel === SafetyLevel.Blocked
  // in token selector, we only show the warning icon if token is >=Medium severity
  // const { colorSecondary: warningIconColor } = getWarningIconColors(severity)
  // const shouldShowWarningModalOnPress = isBlocked || (severity !== WarningSeverity.None && !tokenWarningDismissed)

  const { shouldShowUnichainBridgingAnimation } = useUnichainTooltipVisibility()
  // const isUnichainEth = currency.isNative && currency.chainId === UniverseChainId.Unichain
  // const showUnichainPromoAnimation = shouldShowUnichainBridgingAnimation && isUnichainEth

  const handleShowWarningModal = useCallback((): void => {
    dismissNativeKeyboard()
    setShowWarningModal(true)
  }, [setShowWarningModal])

  const onPressTokenOption = useCallback(() => {
    dispatch(setHasSeenBridgingTooltip(true))
    if (showWarnings) {
      // On mobile web we need to wait for the keyboard to hide
      // before showing the modal to avoid height issues
      if (isKeyboardOpen && isInterface) {
        const activeElement = document.activeElement as HTMLElement | null
        activeElement?.blur()
        setTimeout(handleShowWarningModal, 700)
      } else {
        handleShowWarningModal()
      }
      return
    }

    onPress()
  }, [dispatch, showWarnings, onPress, isKeyboardOpen, handleShowWarningModal])

  const onAcceptTokenWarning = useCallback(() => {
    setShowWarningModal(false)
    onPress()
  }, [onPress])

  // useEffect(() => {
  //   if (showUnichainPromoAnimation) {
  //     // delay to prevent ux jank
  //     const delay = setTimeout(() => {
  //       dispatch(setHasSeenBridgingAnimation(true))
  //     }, ONE_SECOND_MS * 2)
  //     return () => clearTimeout(delay)
  //   }
  //   return undefined
  // }, [dispatch])

  const allTagTokens = useAllTagTokens()
  const addTagTokens = useAddTagTokens()
  const deleteTagTokens = useDeleteTagTokens()

  const handleTagToken = useCallback(
    (ledgerId: string, checked: boolean) => {
      if (checked) {
        addTagTokens([ledgerId])
      } else {
        deleteTagTokens([ledgerId])
      }
    },
    [addTagTokens, deleteTagTokens],
  )

  return (
    <TokenOptionItemWrapper
      tokenInfo={{
        address: currency.ledgerId,
      }}
    >
      <TouchableArea
        animation="300ms"
        hoverStyle={{ backgroundColor: '$surface1Hovered' }}
        // opacity={(showWarnings && severity === WarningSeverity.Blocked) || isUnsupported ? 0.5 : 1}
        opacity={1}
        width="100%"
        onPress={onPressTokenOption}
      >
        <Flex
          row
          alignItems="center"
          gap="$spacing8"
          justifyContent="space-between"
          px="$spacing16"
          py="$spacing12"
          style={{
            pointerEvents: 'auto',
          }}
          testID={`token-option-${currency.ledgerId}-${currency.symbol}`}
        >
          <Flex row shrink alignItems="center" gap="$spacing12">
            <TokenLogo
              name={currency.name}
              symbol={currency.symbol}
              url={getIcExplorerTokenLogo(currency.ledgerId) ?? undefined}
            />
            <Flex shrink>
              <Flex row alignItems="center" gap="$spacing8">
                <UnichainAnimatedText color="$neutral1" delayMs={800} enabled={false} numberOfLines={1} variant="body1">
                  {currency.name}
                </UnichainAnimatedText>
                {/* {warningIconColor && (
                  <Flex>
                    <WarningIcon severity={severity} size="$icon.16" strokeColorOverride={warningIconColor} />
                  </Flex>
                )} */}
              </Flex>
              <Flex row alignItems="center" gap="$spacing8">
                <Text color="$neutral2" numberOfLines={1} variant="body3">
                  {getSymbolDisplayText(currency.symbol)}
                </Text>
                {showTokenAddress && (
                  <Flex shrink>
                    <Text color="$neutral3" numberOfLines={1} variant="body3">
                      {shortenAddress(currency.ledgerId)}
                    </Text>
                  </Flex>
                )}
              </Flex>
            </Flex>
          </Flex>

          {isTagToken ? (
            <Flex grow alignItems="flex-end" justifyContent="center">
              <Switch
                disabled={DEFAULT_TAG_TOKENS.includes(currency.ledgerId)}
                checked={[...allTagTokens, ...DEFAULT_TAG_TOKENS].includes(currency.ledgerId)}
                variant="branded"
                onCheckedChange={(value: boolean): void => {
                  handleTagToken(currency.ledgerId, value)
                }}
              />
            </Flex>
          ) : null}

          {isSelected && (
            <Flex grow alignItems="flex-end" justifyContent="center">
              <Check color={colors.accent1.get()} height={iconSizes.icon20} width={iconSizes.icon20} />
            </Flex>
          )}

          {!isSelected && quantity && quantity !== 0 ? (
            <Flex alignItems="flex-end">
              <Text variant="body1">{balance}</Text>
              {quantityFormatted && (
                <Text color="$neutral2" variant="body3">
                  {quantityFormatted}
                </Text>
              )}
            </Flex>
          ) : null}
        </Flex>
      </TouchableArea>

      {/* <TokenWarningModal
        currencyInfo0={currencyInfo}
        isVisible={showWarningModal}
        closeModalOnly={(): void => setShowWarningModal(false)}
        onAcknowledge={onAcceptTokenWarning}
      /> */}
    </TokenOptionItemWrapper>
  )
}

export const TokenOptionItem = React.memo(_TokenOptionItem)
