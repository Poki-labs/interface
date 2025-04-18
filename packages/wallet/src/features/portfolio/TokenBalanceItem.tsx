import { Currency } from 'poki/src/sdk-core'
import { memo, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Flex, Shine, Text, TouchableArea, isWeb } from 'ui/src'
import { TokenLogo } from 'poki/src/components/CurrencyLogo/TokenLogo'
import { useGlobalContext } from 'poki/src/components/GlobalProvider'
import { RelativeChange } from 'poki/src/components/RelativeChange/RelativeChange'
import { useEnabledChains } from 'poki/src/features/chains/hooks/useEnabledChains'
import { useLocalizationContext } from 'poki/src/features/language/LocalizationContext'
import { useInfoToken } from 'poki/src/features/tokens/useInfoToken'
import { useTokenBalance } from 'poki/src/features/tokens/useTokenBalance'
import { CurrencyId } from 'poki/src/types/currency'
import { IcExplorerTokenDetail } from 'poki/src/types/ic-explorer'
import { getSymbolDisplayText } from 'poki/src/utils/currency'
import { getIcExplorerTokenLogo } from 'poki/src/utils/token-logo'
import { parseTokenAmount } from 'poki/src/utils/tokenAmount'
import { NumberType } from 'utilities/src/format/types'
import { useTokenBalanceMainPartsFragment } from 'wallet/src/features/portfolio/fragments'
import { disableOnPress } from 'wallet/src/utils/disableOnPress'

import BigNumber from 'bignumber.js'
import { useActiveAccountAddressWithThrow } from '../wallet/hooks'

/**
 * IMPORTANT: if you modify the UI of this component, make sure to update the corresponding Skeleton component.
 */

interface TokenBalanceItemProps {
  portfolioBalanceId: string
  currency: Currency
  onPressToken?: (currencyId: CurrencyId) => void
  isLoading?: boolean
  padded?: boolean
}

/**
 * If you add any props to this component, make sure you use the react-devtools profiler to confirm that this doesn't break the memoization.
 * This component needs to be as fast as possible and shouldn't re-render often or else it causes performance issues.
 */
export const TokenBalanceItem = memo(function _TokenBalanceItem({
  portfolioBalanceId,
  currency,
  onPressToken,
  isLoading,
  padded,
}: TokenBalanceItemProps) {
  const onPress = useCallback((): void => {
    onPressToken?.(currency.address)
  }, [currency.address, onPressToken])

  const shortenedSymbol = getSymbolDisplayText(currency.symbol)

  return (
    <TouchableArea
      hoverable
      alignItems="flex-start"
      backgroundColor="$surface1"
      borderRadius="$rounded16"
      flexDirection="row"
      justifyContent="space-between"
      px={padded ? '$spacing24' : '$spacing8'}
      py="$spacing8"
      onLongPress={disableOnPress}
      onPress={onPress}
    >
      <Flex row shrink alignItems="center" gap="$spacing12" overflow="hidden">
        <TokenLogo name={currency.name} symbol={currency.symbol} url={undefined} />
        <Flex shrink alignItems="flex-start">
          <Text ellipsizeMode="tail" numberOfLines={1} variant={isWeb ? 'body2' : 'body1'}>
            {currency.name ?? shortenedSymbol}
          </Text>
          <Flex row alignItems="center" gap="$spacing8" minHeight={20}>
            <TokenBalanceQuantity symbol={currency.symbol} decimals={currency.decimals} tokenId={currency.address} />
          </Flex>
        </Flex>
      </Flex>

      <TokenBalanceRightSideColumn portfolioBalanceId={portfolioBalanceId} isLoading={isLoading} />
    </TouchableArea>
  )
})

interface TokenBalanceItemV2Props {
  tokenInfo: IcExplorerTokenDetail
  onPressToken?: (currencyId: CurrencyId) => void
  isLoading?: boolean
  padded?: boolean
}

/**
 * If you add any props to this component, make sure you use the react-devtools profiler to confirm that this doesn't break the memoization.
 * This component needs to be as fast as possible and shouldn't re-render often or else it causes performance issues.
 */
export const TokenBalanceItemV2 = memo(function _TokenBalanceItem({
  tokenInfo,
  onPressToken,
  padded,
}: TokenBalanceItemV2Props) {
  const onPress = useCallback((): void => {
    onPressToken?.(tokenInfo.ledgerId.toString())
  }, [tokenInfo, onPressToken])

  const shortenedSymbol = getSymbolDisplayText(tokenInfo.symbol)

  return (
    <TouchableArea
      hoverable
      alignItems="flex-start"
      backgroundColor="$surface1"
      borderRadius="$rounded16"
      flexDirection="row"
      justifyContent="space-between"
      px={padded ? '$spacing24' : '$spacing8'}
      py="$spacing8"
      onLongPress={disableOnPress}
      onPress={onPress}
    >
      <Flex row shrink alignItems="center" gap="$spacing12" overflow="hidden">
        <TokenLogo
          name={tokenInfo.name}
          symbol={tokenInfo.symbol}
          url={getIcExplorerTokenLogo(tokenInfo.ledgerId) ?? undefined}
        />
        <Flex shrink alignItems="flex-start">
          <Text ellipsizeMode="tail" numberOfLines={1} variant={isWeb ? 'body2' : 'body1'}>
            {tokenInfo.name ?? shortenedSymbol}
          </Text>
          <Flex row alignItems="center" gap="$spacing8" minHeight={20}>
            <TokenBalanceQuantity
              symbol={tokenInfo.symbol}
              decimals={tokenInfo.tokenDecimal}
              tokenId={tokenInfo.ledgerId}
            />
          </Flex>
        </Flex>
      </Flex>

      {/* <TokenBalanceRightSideColumn portfolioBalanceId={portfolioBalanceId} isLoading={isLoading} /> */}
    </TouchableArea>
  )
})

function TokenBalanceQuantity({
  symbol,
  tokenId,
  decimals,
}: {
  symbol: string
  tokenId: string
  decimals: number
}): JSX.Element {
  const { updateBalanceUSDMap, updateBalanceUSDBeforeChangeMap } = useGlobalContext()

  const address = useActiveAccountAddressWithThrow()
  const { formatNumberOrString } = useLocalizationContext()

  const shortenedSymbol = getSymbolDisplayText(symbol)

  const { result: balance } = useTokenBalance({ principal: address, tokenId: tokenId })

  const infoToken = useInfoToken(tokenId)

  useEffect(() => {
    if (balance && infoToken) {
      updateBalanceUSDMap(tokenId, parseTokenAmount(balance, decimals).multipliedBy(infoToken.priceUSD).toString())

      const usdBeforeChange = new BigNumber(infoToken.priceUSD).div(
        new BigNumber(infoToken.priceUSDChange).dividedBy(100).plus(1),
      )

      updateBalanceUSDBeforeChangeMap(
        tokenId,
        parseTokenAmount(balance, decimals).multipliedBy(usdBeforeChange).toString(),
      )
    }
  }, [infoToken, balance, updateBalanceUSDMap, updateBalanceUSDBeforeChangeMap])

  return (
    <Text color="$neutral2" numberOfLines={1} variant={isWeb ? 'body3' : 'body2'}>
      {balance
        ? `${formatNumberOrString({
            value: parseTokenAmount(balance, decimals).toString(),
          })}`
        : '0'}{' '}
      {shortenedSymbol}
    </Text>
  )
}

function TokenBalanceRightSideColumn({
  portfolioBalanceId,
  isLoading,
}: {
  portfolioBalanceId: string
  isLoading?: boolean
}): JSX.Element {
  const { t } = useTranslation()
  const { isTestnetModeEnabled } = useEnabledChains()
  const { convertFiatAmountFormatted } = useLocalizationContext()

  // By relying on this cached fragment instead of a query with many fields, we can avoid re-renders unless these specific fields change.
  const { data: tokenBalance } = useTokenBalanceMainPartsFragment({ id: portfolioBalanceId })

  const balanceUSD = tokenBalance?.denominatedValue?.value
  const relativeChange24 = tokenBalance?.tokenProjectMarket?.relativeChange24?.value

  const balance = convertFiatAmountFormatted(balanceUSD, NumberType.FiatTokenQuantity)

  const isTestnetModeWithNoBalance = isTestnetModeEnabled && !balanceUSD

  return isTestnetModeWithNoBalance ? (
    <></>
  ) : (
    <Flex justifyContent="space-between" position="relative">
      <Shine disabled={!isLoading}>
        {!balanceUSD ? (
          <Flex centered fill>
            <Text color="$neutral2">{t('common.text.notAvailable')}</Text>
          </Flex>
        ) : (
          <Flex alignItems="flex-end" pl="$spacing8">
            <Text color="$neutral1" numberOfLines={1} variant={isWeb ? 'body2' : 'body1'}>
              {balance}
            </Text>
            <RelativeChange
              alignRight
              change={relativeChange24}
              negativeChangeColor="$statusCritical"
              positiveChangeColor="$statusSuccess"
              variant={isWeb ? 'body3' : 'body2'}
            />
          </Flex>
        )}
      </Shine>
    </Flex>
  )
}
