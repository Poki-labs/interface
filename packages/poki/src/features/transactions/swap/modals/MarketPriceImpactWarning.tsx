import { TFunction } from 'i18next'
import { WarningSeverity } from 'poki/src/components/modals/WarningModal/types'
import { WarningInfo } from 'poki/src/components/modals/WarningModal/WarningInfo'
import { pokiWalletUrls } from 'poki/src/constants/urls'
import { Routing } from 'poki/src/data/tradingApi/__generated__'
import { ModalName } from 'poki/src/features/telemetry/constants'
import { isPokiX } from 'poki/src/features/transactions/swap/utils/routing'
import { openUri } from 'poki/src/utils/linking'
import { PropsWithChildren } from 'react'
import { useTranslation } from 'react-i18next'
import { isWeb, Text, TouchableArea, useSporeColors } from 'ui/src'
import { ChartBar } from 'ui/src/components/icons/ChartBar'

function getPriceImpactInfo(t: TFunction, routing: Routing, missing: boolean): { caption: string; link: string } {
  if (isPokiX({ routing })) {
    if (missing) {
      return {
        caption: t('swap.impactOfTrade.pokix.missing'),
        link: pokiWalletUrls.helpArticleUrls.pokiXInfo,
      }
    } else {
      return {
        caption: t('swap.impactOfTrade.pokix'),
        link: pokiWalletUrls.helpArticleUrls.pokiXInfo,
      }
    }
  } else {
    return {
      caption: t('swap.impactOfTrade'),
      link: pokiWalletUrls.helpArticleUrls.priceImpact,
    }
  }
}

export function MarketPriceImpactWarning({
  children,
  routing,
  missing,
}: PropsWithChildren<{ routing: Routing; missing: boolean }>): JSX.Element {
  const colors = useSporeColors()
  const { t } = useTranslation()

  const { caption, link } = getPriceImpactInfo(t, routing, missing)

  return (
    <WarningInfo
      infoButton={
        <TouchableArea onPress={async () => await openUri(link)}>
          <Text color="$accent1" variant={isWeb ? 'body4' : 'buttonLabel2'}>
            {t('common.button.learn')}
          </Text>
        </TouchableArea>
      }
      modalProps={{
        hideIcon: isWeb,
        icon: <ChartBar color={colors.neutral1.val} size={18} />,
        backgroundIconColor: colors.surface2.get(),
        captionComponent: (
          <Text color="$neutral2" textAlign={isWeb ? 'left' : 'center'} variant={isWeb ? 'body4' : 'body2'}>
            {caption}
          </Text>
        ),
        rejectText: t('common.button.close'),
        modalName: ModalName.NetworkFeeInfo,
        severity: WarningSeverity.None,
        title: t('swap.priceImpact'),
      }}
      tooltipProps={{ text: caption, placement: 'top' }}
    >
      {children}
    </WarningInfo>
  )
}
