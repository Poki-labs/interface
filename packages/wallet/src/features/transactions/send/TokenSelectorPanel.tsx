import { Maybe } from 'graphql/jsutils/Maybe'
import { Currency, CurrencyAmount } from 'poki/src/sdk-core'
import { useTranslation } from 'react-i18next'
import { Flex, Text, TouchableArea } from 'ui/src'
import { RotatableChevron } from 'ui/src/components/icons'
import { iconSizes } from 'ui/src/theme'
import { MaxAmountButton } from 'poki/src/components/CurrencyInputPanel/MaxAmountButton'
import { CurrencyLogo } from 'poki/src/components/CurrencyLogo/CurrencyLogo'
import { TokenSelectorModal, TokenSelectorVariation } from 'poki/src/components/TokenSelector/TokenSelector'
import { TokenSelectorFlow } from 'poki/src/components/TokenSelector/types'
import { CurrencyInfo } from 'poki/src/features/dataApi/types'
import { useLocalizationContext } from 'poki/src/features/language/LocalizationContext'
import { TransactionType } from 'poki/src/features/transactions/types/transactionDetails'
import { CurrencyField } from 'poki/src/types/currency'
import { IcExplorerTokenDetail } from 'poki/src/types/ic-explorer'
import { NumberType } from 'utilities/src/format/types'
import { useActiveAccountAddressWithThrow } from 'wallet/src/features/wallet/hooks'

interface TokenSelectorPanelProps {
  currencyInfo: Maybe<CurrencyInfo>
  currencyBalance: Maybe<CurrencyAmount<Currency>>
  currencyAmount: Maybe<CurrencyAmount<Currency>>
  showTokenSelector: boolean
  onSelectCurrency: (currency: IcExplorerTokenDetail, field: CurrencyField, isBridgePair: boolean) => void
  onHideTokenSelector: () => void
  onShowTokenSelector: () => void
  onSetMax: (amount: string) => void
}

export function TokenSelectorPanel({
  currencyInfo,
  currencyBalance,
  currencyAmount,
  onSetMax,
  onSelectCurrency,
  onHideTokenSelector,
  onShowTokenSelector,
  showTokenSelector,
}: TokenSelectorPanelProps): JSX.Element {
  const { t } = useTranslation()
  const activeAccountAddress = useActiveAccountAddressWithThrow()
  const { formatCurrencyAmount } = useLocalizationContext()

  const showMaxButton = currencyBalance && !currencyBalance.equalTo(0)
  const formattedCurrencyBalance = formatCurrencyAmount({
    value: currencyBalance,
    type: NumberType.TokenNonTx,
  })

  return (
    <>
      <Flex fill overflow="hidden">
        <TokenSelectorModal
          activeAccountAddress={activeAccountAddress}
          currencyField={CurrencyField.INPUT}
          flow={TokenSelectorFlow.Send}
          isModalOpen={showTokenSelector}
          isSurfaceReady={true}
          variation={TokenSelectorVariation.BalancesOnly}
          onClose={onHideTokenSelector}
          onSelectCurrency={onSelectCurrency}
        />
      </Flex>

      <TouchableArea onPress={onShowTokenSelector}>
        <Flex centered row justifyContent="space-between" p="$spacing16">
          <Flex centered row gap="$spacing12">
            <CurrencyLogo currencyInfo={currencyInfo} size={iconSizes.icon36} />
            <Flex gap="$none">
              <Text color="$neutral1" variant="body2">
                {currencyInfo?.name}
              </Text>
              {currencyInfo && (
                <Text color="$neutral2" variant="body3">
                  {t('send.input.token.balance.title', {
                    balance: formattedCurrencyBalance,
                    symbol: currencyInfo.symbol,
                  })}
                </Text>
              )}
            </Flex>
          </Flex>
          <Flex row gap="$spacing12">
            {showMaxButton && onSetMax && (
              <MaxAmountButton
                currencyAmount={currencyAmount}
                currencyBalance={currencyBalance}
                currencyField={CurrencyField.INPUT}
                transactionType={TransactionType.Send}
                onSetMax={onSetMax}
              />
            )}
            <RotatableChevron color="$neutral3" direction="down" height={iconSizes.icon20} width={iconSizes.icon20} />
          </Flex>
        </Flex>
      </TouchableArea>
    </>
  )
}
