import { RouterLabel } from 'poki/src/components/RouterLabel/RouterLabel'
import { WarningInfo } from 'poki/src/components/modals/WarningModal/WarningInfo'
import { WarningSeverity } from 'poki/src/components/modals/WarningModal/types'
import { pokiWalletUrls } from 'poki/src/constants/urls'
import { UniverseChainId } from 'poki/src/features/chains/types'
import { useUSDValueOfGasFee } from 'poki/src/features/gas/hooks'
import { GasFeeResult } from 'poki/src/features/gas/types'
import { FeatureFlags } from 'poki/src/features/gating/flags'
import { useFeatureFlag } from 'poki/src/features/gating/hooks'
import { useLocalizationContext } from 'poki/src/features/language/LocalizationContext'
import { ModalName } from 'poki/src/features/telemetry/constants'
import { useSwapTxContext } from 'poki/src/features/transactions/swap/contexts/SwapTxContext'
import { isClassic, isPokiX } from 'poki/src/features/transactions/swap/utils/routing'
import getRoutingDiagramEntries from 'poki/src/utils/getRoutingDiagramEntries'
import { openUri } from 'poki/src/utils/linking'
import { PropsWithChildren, useMemo } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Flex, PokiXText, Text, TouchableArea, isWeb, useSporeColors } from 'ui/src'
import { OrderRouting } from 'ui/src/components/icons/OrderRouting'

import { NumberType } from 'utilities/src/format/types'

export function RoutingInfo({
  chainId,
  gasFee,
}: PropsWithChildren<{
  chainId: UniverseChainId
  gasFee: GasFeeResult
}>): JSX.Element | null {
  const colors = useSporeColors()
  const { t } = useTranslation()
  const { trade } = useSwapTxContext()
  const { convertFiatAmountFormatted } = useLocalizationContext()
  const { value: gasFeeUSD } = useUSDValueOfGasFee(chainId, gasFee.displayValue ?? undefined)
  const gasFeeFormatted =
    gasFeeUSD !== undefined ? convertFiatAmountFormatted(gasFeeUSD, NumberType.FiatGasPrice) : undefined

  const routes = useMemo(() => (trade && isClassic(trade) ? getRoutingDiagramEntries(trade) : []), [trade])

  const v4Enabled = useFeatureFlag(FeatureFlags.V4Swap)
  const isMaybeV4 = trade && v4Enabled && isClassic(trade)

  const caption = useMemo(() => {
    if (!trade) {
      return null
    }

    const textVariant = isWeb ? 'body4' : 'body2'
    const textAlign = isWeb ? 'left' : 'center'

    if (isPokiX(trade)) {
      return (
        <Text variant={textVariant} textAlign={textAlign} color="$neutral2">
          <Trans
            i18nKey="pokiX.aggregatesLiquidity"
            components={{
              logo: (
                <>
                  <PokiXText variant={textVariant}>PokiX</PokiXText>
                </>
              ),
            }}
          />
        </Text>
      )
    }

    if (isClassic(trade)) {
      return (
        <Flex gap="$spacing12">
          <Text variant={textVariant} textAlign={textAlign} color="$neutral2">
            {gasFeeFormatted && t('swap.bestRoute.cost', { gasPrice: gasFeeFormatted })}
            {t('swap.route.optimizedGasCost')}
          </Text>
        </Flex>
      )
    }
    return null
  }, [t, trade, routes, gasFeeFormatted])

  const InfoButton = useMemo(() => {
    if (!trade) {
      return null
    }
    if (!isMaybeV4 && !isPokiX(trade)) {
      return null
    }

    const helpCenterUrl = pokiWalletUrls.helpArticleUrls.routingSettings

    return (
      <TouchableArea
        onPress={async () => {
          await openUri(helpCenterUrl)
        }}
      >
        <Text color="$accent1" variant={isWeb ? 'body4' : 'buttonLabel2'}>
          {t('common.button.learn')}
        </Text>
      </TouchableArea>
    )
  }, [t, trade, isMaybeV4])

  return (
    <Flex row alignItems="center" justifyContent="space-between">
      <WarningInfo
        infoButton={InfoButton}
        modalProps={{
          modalName: ModalName.SwapReview,
          captionComponent: caption,
          rejectText: t('common.button.close'),
          icon: <OrderRouting color={colors.neutral1.val} size={24} />,
          severity: WarningSeverity.None,
          title: t('swap.tradeRoutes'),
        }}
        tooltipProps={{ text: caption, placement: 'top', maxWidth: trade && isClassic(trade) ? 400 : undefined }}
      >
        <Flex centered row gap="$spacing4">
          <Text color="$neutral2" variant="body3">
            {t('swap.orderRouting')}
          </Text>
        </Flex>
      </WarningInfo>
      <Flex row shrink justifyContent="flex-end">
        <Text adjustsFontSizeToFit color="$neutral1" variant="body3">
          <RouterLabel />
        </Text>
      </Flex>
    </Flex>
  )
}
