import { NetworkLogo } from 'poki/src/components/CurrencyLogo/NetworkLogo'
import { PokiXFee } from 'poki/src/components/gas/NetworkFee'
import { UniverseChainId } from 'poki/src/features/chains/types'
import { useGasFeeFormattedDisplayAmounts } from 'poki/src/features/gas/hooks'
import { GasFeeResult } from 'poki/src/features/gas/types'
import { useTranslation } from 'react-i18next'
import { Flex, Text } from 'ui/src'
import { iconSizes } from 'ui/src/theme'
import { isMobileApp } from 'utilities/src/platform'
import { ContentRow } from 'wallet/src/features/transactions/TransactionRequest/ContentRow'

interface NetworkFeeFooterProps {
  chainId: UniverseChainId
  showNetworkLogo: boolean
  gasFee: GasFeeResult | undefined
  isPokiX?: boolean
}

export function NetworkFeeFooter({
  chainId,
  showNetworkLogo,
  gasFee,
  isPokiX,
}: NetworkFeeFooterProps): JSX.Element | null {
  const { t } = useTranslation()
  const variant = isMobileApp ? 'body3' : 'body4'

  const { gasFeeFormatted } = useGasFeeFormattedDisplayAmounts({
    gasFee,
    chainId,
    placeholder: '-',
  })

  return (
    <Flex px="$spacing8">
      <ContentRow label={t('transaction.networkCost.label')} variant={variant}>
        <Flex centered row gap="$spacing4">
          {showNetworkLogo && <NetworkLogo chainId={chainId} size={iconSizes.icon16} />}
          {isPokiX ? (
            <PokiXFee gasFee={gasFeeFormatted} />
          ) : (
            <Text color="$neutral1" variant={variant}>
              {gasFeeFormatted}
            </Text>
          )}
        </Flex>
      </ContentRow>
    </Flex>
  )
}
