import { getAlertColor } from 'poki/src/components/modals/WarningModal/getAlertColor'
import { Warning } from 'poki/src/components/modals/WarningModal/types'
import { TransactionFailureReason } from 'poki/src/data/tradingApi/__generated__'
import { CurrencyInfo } from 'poki/src/features/dataApi/types'
import { GasFeeResult } from 'poki/src/features/gas/types'
import { FeatureFlags } from 'poki/src/features/gating/flags'
import { useFeatureFlag } from 'poki/src/features/gating/hooks'
import { useLocalizationContext } from 'poki/src/features/language/LocalizationContext'
import Trace from 'poki/src/features/telemetry/Trace'
import { ElementName } from 'poki/src/features/telemetry/constants'
import { TransactionDetails } from 'poki/src/features/transactions/TransactionDetails/TransactionDetails'
import { FeeOnTransferFeeGroupProps, TokenWarningProps } from 'poki/src/features/transactions/TransactionDetails/types'
import { usePriceImpact } from 'poki/src/features/transactions/swap/hooks/usePriceImpact'
import { useParsedSwapWarnings } from 'poki/src/features/transactions/swap/hooks/useSwapWarnings'
import { AcrossRoutingInfo } from 'poki/src/features/transactions/swap/modals/AcrossRoutingInfo'
import { MarketPriceImpactWarning } from 'poki/src/features/transactions/swap/modals/MarketPriceImpactWarning'
import { RoutingInfo } from 'poki/src/features/transactions/swap/modals/RoutingInfo'
import { EstimatedTime } from 'poki/src/features/transactions/swap/review/EstimatedTime'
import { MaxSlippageRow } from 'poki/src/features/transactions/swap/review/MaxSlippageRow'
import { SwapRateRatio } from 'poki/src/features/transactions/swap/review/SwapRateRatio'
import { DerivedSwapInfo } from 'poki/src/features/transactions/swap/types/derivedSwapInfo'
import { PokiXGasBreakdown } from 'poki/src/features/transactions/swap/types/swapTxAndGasInfo'
import { getSwapFeeUsdFromDerivedSwapInfo } from 'poki/src/features/transactions/swap/utils/getSwapFeeUsd'
import { isBridge } from 'poki/src/features/transactions/swap/utils/routing'
import { CurrencyField } from 'poki/src/types/currency'
import { getSymbolDisplayText } from 'poki/src/utils/currency'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Flex, HeightAnimator, Text, TouchableArea } from 'ui/src'
import { NumberType } from 'utilities/src/format/types'
import { isMobileApp, isMobileWeb } from 'utilities/src/platform'

interface SwapDetailsProps {
  acceptedDerivedSwapInfo: DerivedSwapInfo<CurrencyInfo, CurrencyInfo>
  autoSlippageTolerance?: number
  customSlippageTolerance?: number
  derivedSwapInfo: DerivedSwapInfo<CurrencyInfo, CurrencyInfo>
  feeOnTransferProps?: FeeOnTransferFeeGroupProps
  tokenWarningProps: TokenWarningProps
  tokenWarningChecked?: boolean
  gasFallbackUsed?: boolean
  gasFee: GasFeeResult
  pokiXGasBreakdown?: PokiXGasBreakdown
  newTradeRequiresAcceptance: boolean
  warning?: Warning
  onAcceptTrade: () => void
  onShowWarning?: () => void
  setTokenWarningChecked?: (checked: boolean) => void
  txSimulationErrors?: TransactionFailureReason[]
}

export function SwapDetails({
  acceptedDerivedSwapInfo,
  autoSlippageTolerance,
  customSlippageTolerance,
  derivedSwapInfo,
  feeOnTransferProps,
  tokenWarningProps,
  tokenWarningChecked,
  gasFee,
  pokiXGasBreakdown,
  newTradeRequiresAcceptance,
  warning,
  onAcceptTrade,
  onShowWarning,
  setTokenWarningChecked,
  txSimulationErrors,
}: SwapDetailsProps): JSX.Element {
  const v4Enabled = useFeatureFlag(FeatureFlags.V4Swap)
  const { t } = useTranslation()

  const isBridgeTrade = derivedSwapInfo.trade.trade && isBridge(derivedSwapInfo.trade.trade)

  const trade = derivedSwapInfo.trade.trade ?? derivedSwapInfo.trade.indicativeTrade
  const acceptedTrade = acceptedDerivedSwapInfo.trade.trade ?? acceptedDerivedSwapInfo.trade.indicativeTrade

  const swapFeeUsd = getSwapFeeUsdFromDerivedSwapInfo(derivedSwapInfo)

  if (!trade) {
    throw new Error('Invalid render of `SwapDetails` with no `trade`')
  }

  if (!acceptedTrade) {
    throw new Error('Invalid render of `SwapDetails` with no `acceptedTrade`')
  }

  const estimatedBridgingTime = useMemo(() => {
    const tradeQuote = derivedSwapInfo.trade.trade?.quote

    if (!tradeQuote || !isBridge(tradeQuote)) {
      return undefined
    }

    return tradeQuote.quote.estimatedFillTimeMs
  }, [derivedSwapInfo.trade.trade?.quote])

  return (
    <HeightAnimatorWrapper>
      <TransactionDetails
        isSwap
        banner={
          newTradeRequiresAcceptance && (
            <AcceptNewQuoteRow
              acceptedDerivedSwapInfo={acceptedDerivedSwapInfo}
              derivedSwapInfo={derivedSwapInfo}
              onAcceptTrade={onAcceptTrade}
            />
          )
        }
        chainId={acceptedTrade.inputAmount.currency.chainId}
        feeOnTransferProps={feeOnTransferProps}
        tokenWarningProps={tokenWarningProps}
        tokenWarningChecked={tokenWarningChecked}
        setTokenWarningChecked={setTokenWarningChecked}
        gasFee={gasFee}
        swapFee={acceptedTrade.swapFee}
        swapFeeUsd={swapFeeUsd}
        indicative={acceptedTrade.indicative}
        outputCurrency={acceptedTrade.outputAmount.currency}
        showExpandedChildren={!!customSlippageTolerance}
        showWarning={warning && !newTradeRequiresAcceptance}
        transactionUSDValue={derivedSwapInfo.currencyAmountsUSDValue[CurrencyField.OUTPUT]}
        pokiXGasBreakdown={pokiXGasBreakdown}
        warning={warning}
        estimatedBridgingTime={estimatedBridgingTime}
        isBridgeTrade={isBridgeTrade ?? false}
        txSimulationErrors={txSimulationErrors}
        onShowWarning={onShowWarning}
      >
        <Flex row alignItems="center" justifyContent="space-between">
          <Text color="$neutral2" variant="body3">
            {t('swap.details.rate')}
          </Text>
          <Flex row shrink justifyContent="flex-end">
            <SwapRateRatio trade={trade} />
          </Flex>
        </Flex>
        {isBridgeTrade && <EstimatedTime visibleIfLong={false} timeMs={estimatedBridgingTime} />}
        {isBridgeTrade && <AcrossRoutingInfo />}
        {!isBridgeTrade && (
          <MaxSlippageRow
            acceptedDerivedSwapInfo={acceptedDerivedSwapInfo}
            autoSlippageTolerance={autoSlippageTolerance}
            customSlippageTolerance={customSlippageTolerance}
          />
        )}
        {!isBridgeTrade && v4Enabled && (
          <RoutingInfo gasFee={gasFee} chainId={acceptedTrade.inputAmount.currency.chainId} />
        )}
        <PriceImpactRow derivedSwapInfo={acceptedDerivedSwapInfo} />
      </TransactionDetails>
    </HeightAnimatorWrapper>
  )
}

export function PriceImpactRow({
  hide,
  derivedSwapInfo,
}: {
  hide?: boolean
  derivedSwapInfo: DerivedSwapInfo
}): JSX.Element | null {
  const { t } = useTranslation()

  const { formattedPriceImpact } = usePriceImpact({ derivedSwapInfo })
  const { priceImpactWarning } = useParsedSwapWarnings()
  const priceImpactWarningColor = getAlertColor(priceImpactWarning?.severity).text

  const trade = derivedSwapInfo.trade.trade

  if (hide || !trade || isBridge(trade)) {
    return null
  }

  return (
    <Flex row alignItems="center" justifyContent="space-between">
      <MarketPriceImpactWarning routing={trade.routing} missing={!formattedPriceImpact}>
        <Flex centered row gap="$spacing4">
          <Text color="$neutral2" variant="body3">
            {t('swap.priceImpact')}
          </Text>
        </Flex>
      </MarketPriceImpactWarning>
      <Flex row shrink justifyContent="flex-end">
        <Text adjustsFontSizeToFit color={priceImpactWarningColor} variant="body3">
          {formattedPriceImpact ?? 'N/A'}
        </Text>
      </Flex>
    </Flex>
  )
}

function AcceptNewQuoteRow({
  acceptedDerivedSwapInfo,
  derivedSwapInfo,
  onAcceptTrade,
}: {
  acceptedDerivedSwapInfo: DerivedSwapInfo<CurrencyInfo, CurrencyInfo>
  derivedSwapInfo: DerivedSwapInfo<CurrencyInfo, CurrencyInfo>
  onAcceptTrade: () => void
}): JSX.Element {
  const { t } = useTranslation()
  const { formatCurrencyAmount } = useLocalizationContext()

  const derivedCurrencyField =
    derivedSwapInfo.exactCurrencyField === CurrencyField.INPUT ? CurrencyField.OUTPUT : CurrencyField.INPUT

  const derivedAmount = derivedSwapInfo.currencyAmounts[derivedCurrencyField]
  const derivedSymbol = getSymbolDisplayText(derivedSwapInfo.currencies[derivedCurrencyField]?.currency.symbol)
  const formattedDerivedAmount = formatCurrencyAmount({
    value: derivedAmount,
    type: NumberType.TokenTx,
  })

  const percentageDifference = calculatePercentageDifference({
    derivedSwapInfo,
    acceptedDerivedSwapInfo,
  })

  return (
    <Flex
      row
      shrink
      alignItems="center"
      borderColor="$surface3"
      borderRadius="$rounded16"
      borderWidth="$spacing1"
      gap="$spacing12"
      justifyContent="space-between"
      pl="$spacing12"
      pr="$spacing8"
      py="$spacing8"
    >
      <Flex fill>
        <Text color="$neutral2" variant="body3">
          {derivedSwapInfo.exactCurrencyField === CurrencyField.INPUT
            ? t('swap.details.newQuote.output')
            : t('swap.details.newQuote.input')}
        </Text>
        <Flex row alignItems="center">
          <Text adjustsFontSizeToFit color="$neutral1" numberOfLines={1} textAlign="center" variant="body3">
            {formattedDerivedAmount} {derivedSymbol} <Text color="$neutral2">({percentageDifference}%)</Text>
          </Text>
        </Flex>
      </Flex>
      <Flex>
        <Trace logPress element={ElementName.AcceptNewRate}>
          <TouchableArea
            backgroundColor="$accent2"
            borderRadius="$rounded12"
            px="$spacing8"
            py="$spacing4"
            onPress={onAcceptTrade}
          >
            <Text color="$accent1" variant="buttonLabel2">
              {t('common.button.accept')}
            </Text>
          </TouchableArea>
        </Trace>
      </Flex>
    </Flex>
  )
}

// We don't need to animate the height on mobile because bottom sheet already handles the animation.
function HeightAnimatorWrapper({ children }: { children: React.ReactNode }): JSX.Element {
  if (isMobileApp || isMobileWeb) {
    return <>{children}</>
  } else {
    return (
      <HeightAnimator useInitialHeight animation="fast">
        {children}
      </HeightAnimator>
    )
  }
}

function calculatePercentageDifference({
  derivedSwapInfo,
  acceptedDerivedSwapInfo,
}: {
  derivedSwapInfo: DerivedSwapInfo<CurrencyInfo, CurrencyInfo>
  acceptedDerivedSwapInfo: DerivedSwapInfo<CurrencyInfo, CurrencyInfo>
}): string | null {
  const derivedCurrencyField =
    derivedSwapInfo.exactCurrencyField === CurrencyField.INPUT ? CurrencyField.OUTPUT : CurrencyField.INPUT

  // It's important to convert these to fractions before doing math on them in order to preserve full precision on each step.
  const newAmount = derivedSwapInfo.currencyAmounts[derivedCurrencyField]?.asFraction
  const acceptedAmount = acceptedDerivedSwapInfo.currencyAmounts[derivedCurrencyField]?.asFraction

  if (!newAmount || !acceptedAmount) {
    return null
  }

  const percentage = newAmount.subtract(acceptedAmount).divide(acceptedAmount).multiply(100)

  return `${percentage.greaterThan(0) ? '+' : ''}${percentage.toFixed(2)}`
}
