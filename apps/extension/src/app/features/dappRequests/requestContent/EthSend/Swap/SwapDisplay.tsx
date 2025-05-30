import { CurrencyLogo } from 'poki/src/components/CurrencyLogo/CurrencyLogo'
import { SplitLogo } from 'poki/src/components/CurrencyLogo/SplitLogo'
import { UniverseChainId } from 'poki/src/features/chains/types'
import { CurrencyInfo } from 'poki/src/features/dataApi/types'
import { GasFeeResult } from 'poki/src/features/gas/types'
import { useLocalizationContext } from 'poki/src/features/language/LocalizationContext'
import { ValueType, getCurrencyAmount } from 'poki/src/features/tokens/getCurrencyAmount'
import { useUSDCValue } from 'poki/src/features/transactions/swap/hooks/useUSDCPrice'
import { useTranslation } from 'react-i18next'
import { DappRequestContent } from 'src/app/features/dappRequests/DappRequestContent'
import { Flex, Separator, Text } from 'ui/src'
import { ArrowDown } from 'ui/src/components/icons'
import { iconSizes } from 'ui/src/theme'
import { NumberType } from 'utilities/src/format/types'

export function SwapDisplay({
  inputAmount,
  outputAmount,
  inputCurrencyInfo,
  outputCurrencyInfo,
  chainId,
  transactionGasFeeResult,
  onCancel,
  onConfirm,
  isPokiX,
}: {
  inputAmount: string
  outputAmount: string
  inputCurrencyInfo: Maybe<CurrencyInfo>
  outputCurrencyInfo: Maybe<CurrencyInfo>
  chainId: UniverseChainId | null
  transactionGasFeeResult?: GasFeeResult
  onCancel?: () => Promise<void>
  onConfirm?: () => Promise<void>
  isPokiX?: boolean
}): JSX.Element {
  const { t } = useTranslation()
  const { formatCurrencyAmount } = useLocalizationContext()

  const inputCurrencyAmount = getCurrencyAmount({
    value: inputAmount,
    valueType: ValueType.Exact,
    currency: inputCurrencyInfo?.currency,
  })
  const inputValue = useUSDCValue(inputCurrencyAmount)

  const outputCurrencyAmount = getCurrencyAmount({
    value: outputAmount,
    valueType: ValueType.Exact,
    currency: outputCurrencyInfo?.currency,
  })
  const outputValue = useUSDCValue(outputCurrencyAmount)

  const currencyIn = inputCurrencyInfo?.currency
  const currencyOut = outputCurrencyInfo?.currency
  const showSplitLogo = Boolean(inputCurrencyInfo?.logoUrl && outputCurrencyInfo?.logoUrl)
  const showSwapDetails = Boolean(currencyIn?.symbol && currencyOut?.symbol)

  return (
    <DappRequestContent
      showNetworkCost
      confirmText={t('swap.button.swap')}
      headerIcon={
        showSplitLogo ? (
          <SplitLogo
            chainId={chainId}
            inputCurrencyInfo={inputCurrencyInfo}
            outputCurrencyInfo={outputCurrencyInfo}
            size={iconSizes.icon40}
          />
        ) : undefined
      }
      isPokiX={isPokiX}
      title={
        currencyIn?.symbol && currencyOut?.symbol
          ? t('swap.request.title.full', {
              inputCurrencySymbol: currencyIn?.symbol,
              outputCurrencySymbol: currencyOut?.symbol,
            })
          : t('swap.request.title.short')
      }
      transactionGasFeeResult={transactionGasFeeResult}
      onCancel={onCancel}
      onConfirm={onConfirm}
    >
      {showSwapDetails && (
        <>
          <Separator />
          <Flex
            alignItems="flex-start"
            flexDirection="column"
            flexGrow={1}
            gap="$spacing12"
            justifyContent="flex-start"
            px="$spacing8"
            py="$spacing16"
          >
            <Flex flexDirection="row" justifyContent="space-between" width="100%">
              <Flex flexDirection="column">
                <Text color="$neutral1" variant="heading3">
                  {formatCurrencyAmount({ value: inputCurrencyAmount, type: NumberType.TokenTx })} {currencyIn?.symbol}
                </Text>
                <Text color="$neutral2" variant="body3">
                  {formatCurrencyAmount({ value: inputValue, type: NumberType.FiatTokenPrice })}
                </Text>
              </Flex>
              <CurrencyLogo currencyInfo={inputCurrencyInfo} />
            </Flex>
            <ArrowDown color="$neutral3" size="$icon.24" />
            <Flex flexDirection="row" justifyContent="space-between" width="100%">
              <Flex flexDirection="column">
                <Text color="$neutral1" variant="heading3">
                  {formatCurrencyAmount({ value: outputCurrencyAmount, type: NumberType.TokenTx })}{' '}
                  {currencyOut?.symbol}
                </Text>
                <Text color="$neutral2" variant="body3">
                  {formatCurrencyAmount({ value: outputValue, type: NumberType.FiatTokenPrice })}
                </Text>
              </Flex>
              <CurrencyLogo currencyInfo={outputCurrencyInfo} />
            </Flex>
          </Flex>
        </>
      )}
    </DappRequestContent>
  )
}
