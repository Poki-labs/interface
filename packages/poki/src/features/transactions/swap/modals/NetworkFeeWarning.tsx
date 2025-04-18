import { PokiXFee } from 'poki/src/components/gas/NetworkFee'
import { WarningInfo } from 'poki/src/components/modals/WarningModal/WarningInfo'
import { WarningSeverity } from 'poki/src/components/modals/WarningModal/types'
import { LearnMoreLink } from 'poki/src/components/text/LearnMoreLink'
import { InfoTooltipProps } from 'poki/src/components/tooltip/InfoTooltipProps'
import { pokiWalletUrls } from 'poki/src/constants/urls'
import { UniverseChainId } from 'poki/src/features/chains/types'
import { FormattedPokiXGasFeeInfo } from 'poki/src/features/gas/types'
import { ModalName } from 'poki/src/features/telemetry/constants'
import { PropsWithChildren } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Flex, PokiXText, Separator, Text, isWeb, useSporeColors } from 'ui/src'
import { AlertTriangleFilled } from 'ui/src/components/icons/AlertTriangleFilled'
import { Gas } from 'ui/src/components/icons/Gas'
import { NATIVE_LINE_HEIGHT_SCALE, fonts } from 'ui/src/theme'
import { isInterface, isMobileApp } from 'utilities/src/platform'

export function NetworkFeeWarning({
  gasFeeHighRelativeToValue,
  children,
  tooltipTrigger,
  placement = 'top',
  pokiXGasFeeInfo,
  chainId,
}: PropsWithChildren<{
  gasFeeHighRelativeToValue?: boolean
  tooltipTrigger?: InfoTooltipProps['trigger']
  placement?: InfoTooltipProps['placement']
  pokiXGasFeeInfo?: FormattedPokiXGasFeeInfo
  chainId: UniverseChainId
}>): JSX.Element {
  const colors = useSporeColors()
  const { t } = useTranslation()

  const showHighGasFeeUI = gasFeeHighRelativeToValue && !pokiXGasFeeInfo && !isInterface // Avoid high gas UI on interface

  return (
    <WarningInfo
      infoButton={
        pokiXGasFeeInfo ? (
          <PokiXFeeContent pokiXGasFeeInfo={pokiXGasFeeInfo} />
        ) : (
          <LearnMoreLink
            textVariant={isWeb ? 'body4' : undefined}
            url={pokiWalletUrls.helpArticleUrls.networkFeeInfo}
          />
        )
      }
      modalProps={{
        backgroundIconColor: showHighGasFeeUI ? colors.statusCritical2.get() : colors.surface2.get(),
        captionComponent: (
          <NetworkFeeText showHighGasFeeUI={showHighGasFeeUI} pokiXGasFeeInfo={pokiXGasFeeInfo} chainId={chainId} />
        ),
        rejectText: t('common.button.close'),
        icon: showHighGasFeeUI ? (
          <AlertTriangleFilled color="$statusCritical" size="$icon.24" />
        ) : (
          <Gas color="$neutral2" size="$icon.24" />
        ),
        modalName: ModalName.NetworkFeeInfo,
        severity: WarningSeverity.None,
        title: showHighGasFeeUI ? t('transaction.networkCost.veryHigh.label') : t('transaction.networkCost.label'),
      }}
      tooltipProps={{
        text: (
          <NetworkFeeText showHighGasFeeUI={showHighGasFeeUI} pokiXGasFeeInfo={pokiXGasFeeInfo} chainId={chainId} />
        ),
        placement,
        icon: null,
      }}
      trigger={tooltipTrigger}
    >
      {children}
    </WarningInfo>
  )
}

function NetworkFeeText({
  showHighGasFeeUI,
  pokiXGasFeeInfo,
  chainId,
}: {
  showHighGasFeeUI?: boolean
  pokiXGasFeeInfo?: FormattedPokiXGasFeeInfo
  chainId: UniverseChainId
}): JSX.Element {
  const { t } = useTranslation()

  const variant: keyof typeof fonts = isWeb ? 'body4' : 'body2'
  // we need to remove `NATIVE_LINE_HEIGHT_SCALE` if we switch to a button label font
  const lineHeight = fonts[variant].lineHeight / (isWeb ? 1 : NATIVE_LINE_HEIGHT_SCALE)

  if (pokiXGasFeeInfo) {
    // TODO(WEB-4313): Remove need to manually adjust the height of the PokiXText component for mobile.
    const components = { gradient: <PokiXText height={lineHeight} variant={variant} /> }

    return (
      <Text color="$neutral2" textAlign={isWeb ? 'left' : 'center'} variant={variant}>
        {/* TODO(WALL-5311): Investigate Trans component vertical alignment on android */}
        {chainId === UniverseChainId.Unichain ? (
          <Trans components={components} i18nKey="swap.warning.networkFee.message.pokiX.unichain" />
        ) : (
          <Trans components={components} i18nKey="swap.warning.networkFee.message.pokiX" />
        )}
      </Text>
    )
  }

  return (
    <Text color="$neutral2" textAlign={isWeb ? 'left' : 'center'} variant={variant}>
      {showHighGasFeeUI
        ? chainId === UniverseChainId.Unichain
          ? t('swap.warning.networkFee.highRelativeToValue.unichain')
          : t('swap.warning.networkFee.highRelativeToValue')
        : chainId === UniverseChainId.Unichain
          ? t('swap.warning.networkFee.message.unichain')
          : t('swap.warning.networkFee.message')}
    </Text>
  )
}

function PokiXFeeContent({ pokiXGasFeeInfo }: { pokiXGasFeeInfo: FormattedPokiXGasFeeInfo }): JSX.Element {
  const { approvalFeeFormatted, wrapFeeFormatted, swapFeeFormatted, inputTokenSymbol } = pokiXGasFeeInfo
  const { t } = useTranslation()

  return (
    <Flex gap="$spacing12">
      <Flex row centered={isMobileApp} width="100%">
        <LearnMoreLink textVariant={isWeb ? 'body4' : undefined} url={pokiWalletUrls.helpArticleUrls.pokiXInfo} />
      </Flex>
      <Separator />
      {wrapFeeFormatted && (
        <Flex row justifyContent="space-between" width="100%">
          <Text color="$neutral2" variant="body4">
            {t('swap.warning.networkFee.wrap')}
          </Text>
          <Text variant="body4">{wrapFeeFormatted}</Text>
        </Flex>
      )}
      {approvalFeeFormatted && (
        <Flex row justifyContent="space-between" width="100%">
          <Text color="$neutral2" variant="body4">
            {/* FIXME: Verify WALL-5906 */}
            {t('swap.warning.networkFee.allow', { inputTokenSymbol: inputTokenSymbol ?? '' })}
          </Text>
          <Text variant="body4">{approvalFeeFormatted}</Text>
        </Flex>
      )}
      <Flex row justifyContent="space-between" width="100%">
        <Text color="$neutral2" variant="body4">
          {t('common.button.swap')}
        </Text>
        <PokiXFee gasFee={swapFeeFormatted} />
      </Flex>
    </Flex>
  )
}
