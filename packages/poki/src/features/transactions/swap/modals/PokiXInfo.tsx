import { WarningInfo } from 'poki/src/components/modals/WarningModal/WarningInfo'
import { WarningSeverity } from 'poki/src/components/modals/WarningModal/types'
import { LearnMoreLink } from 'poki/src/components/text/LearnMoreLink'
import { InfoTooltipProps } from 'poki/src/components/tooltip/InfoTooltipProps'
import { pokiWalletUrls } from 'poki/src/constants/urls'
import { ModalName } from 'poki/src/features/telemetry/constants'
import { PropsWithChildren } from 'react'
import { useTranslation } from 'react-i18next'
import { PokiXText, isWeb } from 'ui/src'
import { PokiX } from 'ui/src/components/icons/PokiX'
import { colors, opacify } from 'ui/src/theme'

export function PokiXInfo({
  children,
  tooltipTrigger,
  placement = 'top',
}: PropsWithChildren<{
  tooltipTrigger?: InfoTooltipProps['trigger']
  placement?: InfoTooltipProps['placement']
}>): JSX.Element {
  const { t } = useTranslation()

  return (
    <WarningInfo
      infoButton={
        <LearnMoreLink textVariant={isWeb ? 'body4' : undefined} url={pokiWalletUrls.helpArticleUrls.pokiXInfo} />
      }
      modalProps={{
        backgroundIconColor: opacify(16, colors.pokiXPurple),
        caption: t('pokix.description'),
        rejectText: t('common.button.close'),
        icon: <PokiX size="$icon.24" />,
        modalName: ModalName.PokiXInfo,
        severity: WarningSeverity.None,
        titleComponent: <PokiXText variant={isWeb ? 'subheading2' : 'body1'}>{t('pokix.label')}</PokiXText>,
      }}
      tooltipProps={{
        text: t('pokix.description'),
        placement,
        icon: <PokiX size="$icon.24" />,
      }}
      trigger={tooltipTrigger}
    >
      {children}
    </WarningInfo>
  )
}
