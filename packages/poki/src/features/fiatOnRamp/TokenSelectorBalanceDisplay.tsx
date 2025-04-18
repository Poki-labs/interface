import { MaxAmountButton } from 'poki/src/components/CurrencyInputPanel/MaxAmountButton'
import { CurrencyLogo } from 'poki/src/components/CurrencyLogo/CurrencyLogo'
import { CurrencyInfo, PortfolioBalance } from 'poki/src/features/dataApi/types'
import { useFormatExactCurrencyAmount } from 'poki/src/features/fiatOnRamp/hooks'
import { ValueType, getCurrencyAmount } from 'poki/src/features/tokens/getCurrencyAmount'
import { TransactionType } from 'poki/src/features/transactions/types/transactionDetails'
import { TestIDType } from 'poki/src/test/fixtures/testIDs'
import { CurrencyField } from 'poki/src/types/currency'
import { getSymbolDisplayText } from 'poki/src/utils/currency'
import { ComponentProps } from 'react'
import { Flex, SpinningLoader, Text, TouchableArea, useIsDarkMode } from 'ui/src'
import { RotatableChevron } from 'ui/src/components/icons/RotatableChevron'
import { iconSizes, spacing } from 'ui/src/theme'

interface TokenSelectorBalanceDisplayProps {
  onPress: () => void
  onMaxPress: (amount: string) => void
  selectedCurrencyInfo: CurrencyInfo
  disabled?: boolean
  loading?: boolean
  chevronDirection?: ComponentProps<typeof RotatableChevron>['direction']
  testID?: TestIDType
  isOffRamp?: boolean
  portfolioBalance?: PortfolioBalance | null | undefined
  tokenAmount?: number
}

export function TokenSelectorBalanceDisplay({
  selectedCurrencyInfo,
  onPress,
  disabled,
  loading,
  chevronDirection = 'end',
  testID,
  isOffRamp,
  portfolioBalance,
  onMaxPress,
  tokenAmount,
}: TokenSelectorBalanceDisplayProps): JSX.Element {
  const balanceQuantity = portfolioBalance?.quantity.toString() || '0'
  const formattedAmount = useFormatExactCurrencyAmount(balanceQuantity, selectedCurrencyInfo?.currency) || '-'
  const isDarkMode = useIsDarkMode()

  const currencyBalance = getCurrencyAmount({
    value: balanceQuantity,
    valueType: ValueType.Exact,
    currency: selectedCurrencyInfo.currency,
  })

  const currencyAmount = getCurrencyAmount({
    value: tokenAmount?.toString(),
    valueType: ValueType.Exact,
    currency: selectedCurrencyInfo.currency,
  })

  return (
    <TouchableArea borderRadius="$roundedFull" disabled={disabled} testID={testID} onPress={onPress}>
      <Flex
        row
        alignItems="center"
        backgroundColor={isDarkMode ? '$surface2' : '$surface1'}
        borderColor="$surface3"
        borderRadius="$rounded20"
        borderWidth="$spacing1"
        flexDirection="row"
        gap="$gap8"
        p="$spacing12"
        shadowColor="$shadowColor"
        shadowOpacity={0.03}
        shadowRadius={4}
      >
        {loading ? (
          <SpinningLoader size={iconSizes.icon40} />
        ) : (
          <CurrencyLogo
            currencyInfo={selectedCurrencyInfo}
            networkLogoBorderWidth={spacing.spacing1}
            size={iconSizes.icon40}
          />
        )}
        <Flex grow>
          <Text color="$neutral1" variant="body2">
            {selectedCurrencyInfo.currency.name}
          </Text>
          <Text color="$neutral2" variant="body3">
            Balance: {formattedAmount}
            {getSymbolDisplayText(selectedCurrencyInfo.currency.symbol)}
          </Text>
        </Flex>
        {isOffRamp && (
          <MaxAmountButton
            currencyAmount={currencyAmount}
            currencyBalance={currencyBalance}
            currencyField={CurrencyField.INPUT}
            transactionType={TransactionType.Send}
            onSetMax={onMaxPress}
          />
        )}
        <RotatableChevron color="$neutral3" direction={chevronDirection} height={iconSizes.icon24} />
      </Flex>
    </TouchableArea>
  )
}
