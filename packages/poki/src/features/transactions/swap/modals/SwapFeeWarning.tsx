import { WarningInfo } from 'poki/src/components/modals/WarningModal/WarningInfo'
import { WarningSeverity } from 'poki/src/components/modals/WarningModal/types'
import { pokiWalletUrls } from 'poki/src/constants/urls'
import { ModalName } from 'poki/src/features/telemetry/constants'
import { openUri } from 'poki/src/utils/linking'
import { PropsWithChildren } from 'react'
import { useTranslation } from 'react-i18next'
import { Text, TouchableArea, isWeb, useSporeColors } from 'ui/src'
import { AlertCircleFilled } from 'ui/src/components/icons/AlertCircleFilled'
import { iconSizes } from 'ui/src/theme'

export function SwapFeeWarning({ noFee, children }: PropsWithChildren<{ noFee: boolean }>): JSX.Element {
  const colors = useSporeColors()
  const { t } = useTranslation()

  const onPressLearnMore = async (): Promise<void> => {
    await openUri(pokiWalletUrls.helpArticleUrls.swapFeeInfo)
  }

  const caption = noFee ? t('swap.warning.pokiFee.message.default') : t('swap.warning.pokiFee.message.included')

  return (
    <WarningInfo
      infoButton={
        <TouchableArea onPress={onPressLearnMore}>
          <Text color="$accent1" variant={isWeb ? 'body4' : 'buttonLabel2'}>
            {t('common.button.learn')}
          </Text>
        </TouchableArea>
      }
      modalProps={{
        icon: <AlertCircleFilled color="$neutral1" size={iconSizes.icon20} />,
        backgroundIconColor: colors.surface2.get(),
        captionComponent: (
          <Text color="$neutral2" textAlign={isWeb ? 'left' : 'center'} variant={isWeb ? 'body4' : 'body2'}>
            {caption}
          </Text>
        ),
        rejectText: t('common.button.close'),
        modalName: ModalName.NetworkFeeInfo,
        severity: WarningSeverity.None,
        title: t('swap.warning.pokiFee.title'),
      }}
      tooltipProps={{ text: caption, placement: 'top' }}
    >
      {children}
    </WarningInfo>
  )
}
