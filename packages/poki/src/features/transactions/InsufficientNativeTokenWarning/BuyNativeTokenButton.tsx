import { usePokiContext } from 'poki/src/contexts/PokiContext'
import { useEnabledChains } from 'poki/src/features/chains/hooks/useEnabledChains'
import { CurrencyInfo } from 'poki/src/features/dataApi/types'
import { useIsSupportedFiatOnRampCurrency } from 'poki/src/features/fiatOnRamp/hooks'
import Trace from 'poki/src/features/telemetry/Trace'
import { ElementName } from 'poki/src/features/telemetry/constants'
import { useNetworkColors } from 'poki/src/utils/colors'
import { useTranslation } from 'react-i18next'
import { DeprecatedButton, isWeb } from 'ui/src'
import { opacify, validColor } from 'ui/src/theme'

export function BuyNativeTokenButton({
  nativeCurrencyInfo,
  canBridge,
  onPress,
}: {
  nativeCurrencyInfo: CurrencyInfo
  canBridge: boolean
  onPress?: () => void
}): JSX.Element {
  const { t } = useTranslation()
  const { defaultChainId } = useEnabledChains()
  const { foreground, background } = useNetworkColors(nativeCurrencyInfo.currency?.chainId ?? defaultChainId)
  const primaryColor = validColor(foreground)
  const backgroundColor = validColor(background)
  const onPressColor = validColor(opacify(50, foreground))

  const { navigateToFiatOnRamp } = usePokiContext()
  const fiatOnRampCurrency = useIsSupportedFiatOnRampCurrency(nativeCurrencyInfo?.currencyId ?? '', !nativeCurrencyInfo)

  const onPressBuyFiatOnRamp = (): void => {
    navigateToFiatOnRamp({ prefilledCurrency: fiatOnRampCurrency })
    onPress?.()
  }

  return (
    <Trace logPress element={ElementName.BuyNativeTokenButton}>
      <DeprecatedButton
        {...(canBridge
          ? undefined
          : {
              backgroundColor,
              color: primaryColor,
              pressStyle: { backgroundColor: onPressColor },
            })}
        size={isWeb ? 'small' : 'medium'}
        theme={canBridge ? 'secondary' : 'primary'}
        width="100%"
        onPress={onPressBuyFiatOnRamp}
      >
        {canBridge
          ? t('swap.warning.insufficientGas.button.buyWithCard')
          : // FIXME: Verify WALL-5906
            t('swap.warning.insufficientGas.button.buy', { tokenSymbol: nativeCurrencyInfo.currency.symbol ?? '' })}
      </DeprecatedButton>
    </Trace>
  )
}
