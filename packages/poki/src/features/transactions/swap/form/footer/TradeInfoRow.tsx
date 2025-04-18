import { NetworkLogo } from 'poki/src/components/CurrencyLogo/NetworkLogo'
import { PokiXFee } from 'poki/src/components/gas/NetworkFee'
import { WarningInfo } from 'poki/src/components/modals/WarningModal/WarningInfo'
import { getAlertColor } from 'poki/src/components/modals/WarningModal/getAlertColor'
import { Warning, WarningLabel } from 'poki/src/components/modals/WarningModal/types'
import { getCanonicalBridgingDappUrls } from 'poki/src/features/bridging/constants'
import { useEnabledChains } from 'poki/src/features/chains/hooks/useEnabledChains'
import { UniverseChainId } from 'poki/src/features/chains/types'
import { getChainLabel } from 'poki/src/features/chains/utils'
import {
  useFormattedPokiXGasFeeInfo,
  useGasFeeFormattedDisplayAmounts,
  useGasFeeHighRelativeToValue,
} from 'poki/src/features/gas/hooks'
import { FormattedPokiXGasFeeInfo, GasFeeResult } from 'poki/src/features/gas/types'
import { ModalName } from 'poki/src/features/telemetry/constants'
import { useSwapFormContext } from 'poki/src/features/transactions/swap/contexts/SwapFormContext'
import { useSwapTxContext } from 'poki/src/features/transactions/swap/contexts/SwapTxContext'
import { NetworkFeeWarning } from 'poki/src/features/transactions/swap/modals/NetworkFeeWarning'
import { SwapRateRatio } from 'poki/src/features/transactions/swap/review/SwapRateRatio'
import { IndicativeTrade, Trade } from 'poki/src/features/transactions/swap/types/trade'
import { isPokiX } from 'poki/src/features/transactions/swap/utils/routing'
import { CurrencyField } from 'poki/src/types/currency'
import { useNetworkColors } from 'poki/src/utils/colors'
import { openUri } from 'poki/src/utils/linking'
import { PropsWithChildren, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Accordion, Flex, Text, TouchableArea } from 'ui/src'
import { Arrow } from 'ui/src/components/arrow/Arrow'
import { AlertTriangleFilled } from 'ui/src/components/icons/AlertTriangleFilled'
import { Gas } from 'ui/src/components/icons/Gas'
import { RotatableChevron } from 'ui/src/components/icons/RotatableChevron'
import { iconSizes, validColor } from 'ui/src/theme'
import { isInterface, isMobileApp } from 'utilities/src/platform'
import { usePrevious } from 'utilities/src/react/hooks'

type DebouncedGasInfo = {
  gasFee: GasFeeResult
  fiatPriceFormatted?: string
  pokiXGasFeeInfo?: FormattedPokiXGasFeeInfo
  isHighRelativeToValue: boolean
  isLoading: boolean
  chainId: UniverseChainId
}

export function useDebouncedGasInfo(): DebouncedGasInfo {
  const {
    derivedSwapInfo: { chainId, currencyAmountsUSDValue, trade, currencyAmounts, exactCurrencyField },
  } = useSwapFormContext()
  const inputUSDValue = currencyAmountsUSDValue[CurrencyField.INPUT]
  const outputUSDValue = currencyAmountsUSDValue[CurrencyField.OUTPUT]

  const swapTxContext = useSwapTxContext()
  const { gasFee } = swapTxContext
  const pokiXGasFeeInfo = useFormattedPokiXGasFeeInfo(
    isPokiX(swapTxContext) ? swapTxContext.gasFeeBreakdown : undefined,
    chainId,
  )

  const { gasFeeFormatted, gasFeeUSD } = useGasFeeFormattedDisplayAmounts({
    gasFee,
    chainId,
    placeholder: undefined,
  })

  const isHighRelativeToValue = useGasFeeHighRelativeToValue(gasFeeUSD, outputUSDValue ?? inputUSDValue)

  const amountChanged = usePrevious(currencyAmounts[exactCurrencyField]) !== currencyAmounts[exactCurrencyField]
  const tradeChanged = usePrevious(trade.trade) !== trade.trade && Boolean(trade.trade)

  const tradeLoadingOrRefetching = Boolean(trade.isLoading || trade.isFetching)
  const gasLoading = Boolean(gasFee.isLoading || (gasFee.value && !gasFeeUSD))

  const isLoading = tradeLoadingOrRefetching || gasLoading || amountChanged || tradeChanged

  const [info, setInfo] = useState<DebouncedGasInfo>({
    gasFee,
    isHighRelativeToValue,
    pokiXGasFeeInfo,
    isLoading,
    chainId,
  })

  useEffect(() => {
    if (isLoading) {
      setInfo((prev) => ({ ...prev, isLoading }))
    } else {
      setInfo({
        gasFee,
        fiatPriceFormatted: gasFeeFormatted ?? undefined,
        isHighRelativeToValue,
        pokiXGasFeeInfo,
        isLoading,
        chainId,
      })
    }
  }, [gasFee, gasFeeFormatted, isHighRelativeToValue, isLoading, pokiXGasFeeInfo, chainId])

  return info
}

function useDebouncedTrade(): Trade | IndicativeTrade | undefined {
  const {
    derivedSwapInfo: { trade },
  } = useSwapFormContext()
  const [debouncedTrade, setDebouncedTrade] = useState<Trade | IndicativeTrade>()

  useEffect(() => {
    if (trade.trade) {
      setDebouncedTrade(trade.trade)
    } else if (trade.indicativeTrade) {
      setDebouncedTrade(trade.indicativeTrade)
    } else if (!trade.isLoading) {
      setDebouncedTrade(undefined)
    }
  }, [trade.indicativeTrade, trade.isLoading, trade.trade])

  return debouncedTrade
}

function GasRow({ gasInfo, hidden }: { gasInfo: DebouncedGasInfo; hidden?: boolean }): JSX.Element | null {
  if (gasInfo.fiatPriceFormatted) {
    const color = gasInfo.isHighRelativeToValue && !isInterface ? '$statusCritical' : '$neutral2' // Avoid high gas UI on interface
    const pokiXSavings = gasInfo.pokiXGasFeeInfo?.preSavingsGasFeeFormatted
    const body = pokiXSavings ? (
      <PokiXFee gasFee={gasInfo.fiatPriceFormatted} preSavingsGasFee={pokiXSavings} />
    ) : (
      <>
        <Gas color={color} size="$icon.16" />
        <Text color={color} variant="body3">
          {gasInfo.fiatPriceFormatted}
        </Text>
      </>
    )

    return (
      <Flex
        centered
        row
        animation="quick"
        enterStyle={{ opacity: 0 }}
        opacity={hidden ? 0 : gasInfo.isLoading ? 0.6 : 1}
      >
        <NetworkFeeWarning
          gasFeeHighRelativeToValue={gasInfo.isHighRelativeToValue}
          placement={isInterface ? 'right' : 'bottom'}
          tooltipTrigger={
            <Flex centered row gap="$spacing4">
              {body}
            </Flex>
          }
          pokiXGasFeeInfo={gasInfo.pokiXGasFeeInfo}
          chainId={gasInfo.chainId}
        />
      </Flex>
    )
  } else {
    return null
  }
}

// TradeInfoRow take `gasInfo` as a prop (rather than directly using useDebouncedGasInfo) because on mobile,
// the parent needs to check whether to render an empty row based on `gasInfo` fields first.
export function TradeInfoRow({
  gasInfo,
  warning,
}: {
  gasInfo: DebouncedGasInfo
  warning?: Warning
}): JSX.Element | null {
  // Debounce the trade to prevent flickering on input
  const debouncedTrade = useDebouncedTrade()
  const warningColor = getAlertColor(warning?.severity)
  const { isTestnetModeEnabled } = useEnabledChains()

  const {
    derivedSwapInfo: { currencies },
  } = useSwapFormContext()

  if (isTestnetModeEnabled) {
    return null
  }

  if (isMobileApp) {
    return <GasRow gasInfo={gasInfo} />
  }

  // On interface, if the warning is a no quotes found warning, we want to show an external link to a canonical bridge

  const inputChainId = currencies.input?.currency.chainId
  const outputChainId = currencies.output?.currency.chainId
  const showCanonicalBridge =
    isInterface && warning?.type === WarningLabel.NoQuotesFound && inputChainId !== outputChainId

  return (
    <Flex centered row>
      <Flex fill>
        {debouncedTrade && !warning && (
          <SwapRateRatio initialInverse={true} styling="secondary" trade={debouncedTrade} />
        )}

        {warning && (
          <TradeWarning warning={warning}>
            <Flex row centered gap="$gap8">
              <AlertTriangleFilled color={warningColor.text} size="$icon.20" />
              <Text color={warningColor.text} variant="body3">
                {warning.title}
              </Text>
            </Flex>
          </TradeWarning>
        )}
      </Flex>

      {showCanonicalBridge ? (
        <CanonicalBridgeLink chainId={outputChainId ?? UniverseChainId.Mainnet} />
      ) : debouncedTrade ? (
        <Accordion.Trigger
          p="$none"
          style={{ background: '$surface1' }}
          focusStyle={{ background: '$surface1' }}
          hoverStyle={{ background: '$surface1' }}
        >
          {({ open }: { open: boolean }) => (
            <Flex row gap="$spacing4" alignItems="center">
              <GasRow gasInfo={gasInfo} hidden={open} />
              <RotatableChevron
                animation="fast"
                width={iconSizes.icon16}
                height={iconSizes.icon16}
                direction={open ? 'up' : 'down'}
                color="$neutral3"
              />
            </Flex>
          )}
        </Accordion.Trigger>
      ) : (
        <GasRow gasInfo={gasInfo} />
      )}
    </Flex>
  )
}

export function TradeWarning({ children, warning }: PropsWithChildren<{ warning: Warning }>): JSX.Element {
  const { t } = useTranslation()

  const caption = warning.message

  return (
    <Flex animation="quick" enterStyle={{ opacity: 0 }}>
      <WarningInfo
        modalProps={{
          caption,
          rejectText: t('common.button.close'),
          modalName: ModalName.SwapWarning,
          severity: warning.severity,
          title: warning.title ?? '',
          icon: <AlertTriangleFilled color="$statusCritical" size="$icon.16" />,
        }}
        tooltipProps={{ text: caption ?? '', placement: 'bottom' }}
        trigger={children}
      />
    </Flex>
  )
}

function CanonicalBridgeLink({ chainId }: { chainId: UniverseChainId }): JSX.Element {
  const { foreground } = useNetworkColors(chainId)

  const networkLabel = getChainLabel(chainId)
  const networkColor = validColor(foreground)
  const canonicalBridgeUrl = getCanonicalBridgingDappUrls([chainId])?.[0]

  return (
    <TouchableArea onPress={() => canonicalBridgeUrl && openUri(canonicalBridgeUrl)}>
      <Flex row gap="$spacing8" alignItems="center">
        <NetworkLogo chainId={chainId} size={iconSizes.icon20} />
        <Text color={networkColor} variant="buttonLabel3">
          {networkLabel} Bridge
        </Text>
        <Arrow color={networkColor} direction="ne" size={iconSizes.icon20} />
      </Flex>
    </TouchableArea>
  )
}
