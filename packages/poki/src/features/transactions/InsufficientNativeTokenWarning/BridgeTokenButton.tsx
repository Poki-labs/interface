import { usePokiContext } from 'poki/src/contexts/PokiContext'
import { UniverseChainId } from 'poki/src/features/chains/types'
import { CurrencyInfo } from 'poki/src/features/dataApi/types'
import Trace from 'poki/src/features/telemetry/Trace'
import { ElementName } from 'poki/src/features/telemetry/constants'
import { useNetworkColors } from 'poki/src/utils/colors'
import { useTranslation } from 'react-i18next'
import { DeprecatedButton, isWeb } from 'ui/src'
import { opacify, validColor } from 'ui/src/theme'

export function BridgeTokenButton({
  inputToken,
  outputToken,
  outputNetworkName,
  onPress,
}: {
  inputToken: CurrencyInfo
  outputToken: CurrencyInfo
  outputNetworkName: string
  onPress?: () => void
}): JSX.Element {
  const { t } = useTranslation()
  const { foreground, background } = useNetworkColors(outputToken.currency?.chainId ?? UniverseChainId.Mainnet)
  const primaryColor = validColor(foreground)
  const backgroundColor = validColor(background)
  const onPressColor = validColor(opacify(50, foreground))

  const { navigateToSwapFlow } = usePokiContext()

  const onPressBridgeToken = (): void => {
    onPress?.()
    navigateToSwapFlow({
      inputCurrencyId: inputToken.currencyId,
      outputCurrencyId: outputToken.currencyId,
    })
  }

  if (!outputToken.currency.symbol) {
    throw new Error(
      'Unexpected render of `BridgeTokenButton` without a token symbol for currency ' + outputToken.currencyId,
    )
  }

  return (
    <Trace logPress element={ElementName.BuyNativeTokenButton}>
      <DeprecatedButton
        backgroundColor={backgroundColor}
        color={primaryColor}
        pressStyle={{ backgroundColor: onPressColor }}
        size={isWeb ? 'small' : 'medium'}
        theme="primary"
        width="100%"
        onPress={onPressBridgeToken}
      >
        {t('swap.warning.insufficientGas.button.bridge', {
          tokenSymbol: outputToken.currency.symbol,
          networkName: outputNetworkName,
        })}
      </DeprecatedButton>
    </Trace>
  )
}
