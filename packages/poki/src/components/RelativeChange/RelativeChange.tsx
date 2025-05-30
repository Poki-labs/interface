import { useAppFiatCurrencyInfo } from 'poki/src/features/fiatCurrency/hooks'
import { useLocalizationContext } from 'poki/src/features/language/LocalizationContext'
import { TestID } from 'poki/src/test/fixtures/testIDs'
import { ColorTokens, Flex, Text } from 'ui/src'
import { Caret } from 'ui/src/components/icons/Caret'
import { IconSizeTokens, fonts } from 'ui/src/theme'
import { NumberType } from 'utilities/src/format/types'

interface RelativeChangeProps {
  change?: number
  absoluteChange?: number
  variant?: keyof typeof fonts
  semanticColor?: boolean // If true, entire % change text will render green or red
  positiveChangeColor?: ColorTokens
  negativeChangeColor?: ColorTokens
  arrowSize?: IconSizeTokens
  loading?: boolean
  alignRight?: boolean
}

export function RelativeChange(props: RelativeChangeProps): JSX.Element {
  const {
    absoluteChange,
    change,
    variant = 'subheading2',
    semanticColor,
    positiveChangeColor = '$statusSuccess',
    negativeChangeColor = '$statusCritical',
    arrowSize = '$icon.16',
    loading = false,
    alignRight = false,
  } = props
  const { formatNumberOrString, formatPercent } = useLocalizationContext()
  const currency = useAppFiatCurrencyInfo()

  const isPositiveChange = change !== undefined ? change >= 0 : undefined
  const arrowColor = isPositiveChange ? positiveChangeColor : negativeChangeColor

  const formattedChange = formatPercent(change !== undefined ? Math.abs(change) : change)
  const formattedAbsChange = absoluteChange
    ? `${formatNumberOrString({
        value: Math.abs(absoluteChange),
        type: NumberType.PortfolioBalance,
        currencyCode: currency.code,
      })}`
    : ''

  return (
    <Flex
      row
      alignItems="center"
      gap="$spacing2"
      justifyContent={alignRight ? 'flex-end' : 'flex-start'}
      testID="relative-change"
    >
      {change !== undefined && <Caret color={arrowColor} direction={isPositiveChange ? 'n' : 's'} size={arrowSize} />}
      <Flex>
        <Text
          color={semanticColor ? (isPositiveChange ? '$statusSuccess' : '$statusCritical') : '$neutral2'}
          loading={loading}
          loadingPlaceholderText="▲ 00.00 (0.00)%"
          testID={TestID.PortfolioRelativeChange}
          variant={variant}
        >
          {absoluteChange ? `${formattedAbsChange} (${formattedChange})` : formattedChange}
        </Text>
      </Flex>
    </Flex>
  )
}
