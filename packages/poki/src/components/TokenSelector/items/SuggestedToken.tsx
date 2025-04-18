import { TokenLogo } from 'poki/src/components/CurrencyLogo/TokenLogo'
import { OnSelectCurrency, TokenOption, TokenSection } from 'poki/src/components/TokenSelector/types'
import { Pill } from 'poki/src/components/pill/Pill'
import { getSymbolDisplayText } from 'poki/src/utils/currency'
import { memo } from 'react'
import { TouchableArea, useMedia, useSporeColors } from 'ui/src'
import { iconSizes } from 'ui/src/theme'

function _TokenPill({
  onSelectCurrency,
  token,
  index,
  section,
}: {
  onSelectCurrency: OnSelectCurrency
  token: TokenOption
  index: number
  section: TokenSection
}): JSX.Element {
  const { currency, logoUrl } = token.currencyInfo
  const colors = useSporeColors()
  const media = useMedia()

  const onPress = (): void => {
    onSelectCurrency?.(token.currencyInfo, section, index)
  }

  return (
    <TouchableArea
      hoverable
      borderRadius="$roundedFull"
      testID={`token-option-${currency.chainId}-${currency.symbol}`}
      onPress={onPress}
    >
      <Pill
        borderColor="$surface3Solid"
        borderRadius="$roundedFull"
        borderWidth="$spacing1"
        foregroundColor={colors.neutral1.val}
        icon={
          <TokenLogo
            chainId={currency.chainId}
            name={currency.name}
            size={iconSizes.icon24}
            symbol={currency.symbol}
            url={logoUrl}
          />
        }
        label={getSymbolDisplayText(currency.symbol)}
        pl="$spacing4"
        pr="$spacing12"
        py="$spacing4"
        textVariant={media.xxs ? 'buttonLabel2' : 'buttonLabel1'}
      />
    </TouchableArea>
  )
}

export const TokenPill = memo(_TokenPill)
