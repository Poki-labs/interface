import BigNumber from 'bignumber.js'
import { memo } from 'react'
import { Flex, Shine } from 'ui/src'
import AnimatedNumber, {
  BALANCE_CHANGE_INDICATION_DURATION,
} from 'poki/src/components/AnimatedNumber/AnimatedNumber'
import { useGlobalContext } from 'poki/src/components/GlobalProvider'
import { RelativeChange } from 'poki/src/components/RelativeChange/RelativeChange'
import { PollingInterval } from 'poki/src/constants/misc'
import { usePortfolioTotalValue } from 'poki/src/features/dataApi/balances'
import { FiatCurrency } from 'poki/src/features/fiatCurrency/constants'
import { useAppFiatCurrency, useAppFiatCurrencyInfo } from 'poki/src/features/fiatCurrency/hooks'
import { useLocalizationContext } from 'poki/src/features/language/LocalizationContext'
import i18next from 'poki/src/i18n'
import { NumberType } from 'utilities/src/format/types'
import { isWarmLoadingStatus } from 'wallet/src/data/utils'

interface PortfolioBalanceProps {
  owner: Address
}

export const PortfolioBalance = memo(function _PortfolioBalance({ owner }: PortfolioBalanceProps): JSX.Element {
  const { balanceUSD, balanceUSDBeforeChange } = useGlobalContext()

  const { data, loading, networkStatus } = usePortfolioTotalValue({
    address: owner,
    // TransactionHistoryUpdater will refetch this query on new transaction.
    // No need to be super aggressive with polling here.
    pollInterval: PollingInterval.Normal,
  })

  const currency = useAppFiatCurrency()
  const currencyComponents = useAppFiatCurrencyInfo()
  const { convertFiatAmount, convertFiatAmountFormatted } = useLocalizationContext()

  const isLoading = loading && !data
  const isWarmLoading = !!data && isWarmLoadingStatus(networkStatus)

  const absoluteChangeUSD =
    balanceUSDBeforeChange && balanceUSD
      ? new BigNumber(balanceUSD).minus(balanceUSDBeforeChange).toNumber()
      : undefined

  const percentChange =
    absoluteChangeUSD && balanceUSD
      ? new BigNumber(new BigNumber(absoluteChangeUSD).dividedBy(balanceUSD).multipliedBy(100).toFixed(2)).toNumber()
      : undefined

  const isRightToLeft = i18next.dir() === 'rtl'

  const totalBalance = convertFiatAmountFormatted(balanceUSD, NumberType.PortfolioBalance)
  const absoluteChange = absoluteChangeUSD && convertFiatAmount(absoluteChangeUSD).amount
  // TODO gary re-enabling this for USD/Euros only, replace with more scalable approach
  const shouldFadePortfolioDecimals =
    (currency === FiatCurrency.UnitedStatesDollar || currency === FiatCurrency.Euro) && currencyComponents.symbolAtFront

  return (
    <Flex gap="$spacing4">
      <AnimatedNumber
        balance={balanceUSD ? Number(balanceUSD) : undefined}
        colorIndicationDuration={BALANCE_CHANGE_INDICATION_DURATION}
        loading={isLoading}
        loadingPlaceholderText="000000.00"
        shouldFadeDecimals={shouldFadePortfolioDecimals}
        value={totalBalance}
        warmLoading={isWarmLoading}
        isRightToLeft={isRightToLeft}
      />
      <Shine disabled={!isWarmLoading}>
        <RelativeChange
          absoluteChange={absoluteChange}
          arrowSize="$icon.16"
          change={percentChange}
          loading={isLoading}
          negativeChangeColor={isWarmLoading ? '$neutral2' : '$statusCritical'}
          positiveChangeColor={isWarmLoading ? '$neutral2' : '$statusSuccess'}
          variant="body3"
        />
      </Shine>
    </Flex>
  )
})
