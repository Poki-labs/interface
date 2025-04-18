import { NetworkLogo } from 'poki/src/components/CurrencyLogo/NetworkLogo'
import { IndicativeLoadingWrapper } from 'poki/src/components/misc/IndicativeLoadingWrapper'
import { UniverseChainId } from 'poki/src/features/chains/types'
import {
  useFormattedPokiXGasFeeInfo,
  useGasFeeFormattedDisplayAmounts,
  useGasFeeHighRelativeToValue,
} from 'poki/src/features/gas/hooks'
import { GasFeeResult } from 'poki/src/features/gas/types'
import { NetworkFeeWarning } from 'poki/src/features/transactions/swap/modals/NetworkFeeWarning'
import { PokiXGasBreakdown } from 'poki/src/features/transactions/swap/types/swapTxAndGasInfo'
import { Currency, CurrencyAmount } from 'poki/src/sdk-core'
import { useTranslation } from 'react-i18next'
import { Flex, PokiXText, Text } from 'ui/src'
import { PokiX } from 'ui/src/components/icons/PokiX'
import { iconSizes } from 'ui/src/theme'
import { isInterface } from 'utilities/src/platform'

export function NetworkFee({
  chainId,
  gasFee,
  pokiXGasBreakdown,
  transactionUSDValue,
  indicative,
}: {
  chainId: UniverseChainId
  gasFee: GasFeeResult
  pokiXGasBreakdown?: PokiXGasBreakdown
  transactionUSDValue?: Maybe<CurrencyAmount<Currency>>
  indicative?: boolean
}): JSX.Element {
  const { t } = useTranslation()

  const { gasFeeFormatted, gasFeeUSD } = useGasFeeFormattedDisplayAmounts({
    gasFee,
    chainId,
    placeholder: '-',
  })

  const pokiXGasFeeInfo = useFormattedPokiXGasFeeInfo(pokiXGasBreakdown, chainId)

  const gasFeeHighRelativeToValue = useGasFeeHighRelativeToValue(gasFeeUSD, transactionUSDValue)
  const showHighGasFeeUI = gasFeeHighRelativeToValue && !isInterface // Avoid high gas UI on interface

  return (
    <Flex row alignItems="center" gap="$spacing12" justifyContent="space-between">
      <NetworkFeeWarning
        gasFeeHighRelativeToValue={gasFeeHighRelativeToValue}
        pokiXGasFeeInfo={pokiXGasFeeInfo}
        chainId={chainId}
      >
        <Text color="$neutral2" flexShrink={1} numberOfLines={3} variant="body3">
          {t('transaction.networkCost.label')}
        </Text>
      </NetworkFeeWarning>
      <IndicativeLoadingWrapper loading={indicative || (!gasFee.value && gasFee.isLoading)}>
        <Flex row alignItems="center" gap={pokiXGasBreakdown ? '$spacing4' : '$spacing8'}>
          {(!pokiXGasBreakdown || gasFee.error) && (
            <NetworkLogo chainId={chainId} shape="square" size={iconSizes.icon16} />
          )}
          {gasFee.error ? (
            <Text color="$neutral2" variant="body3">
              {t('common.text.notAvailable')}
            </Text>
          ) : pokiXGasBreakdown ? (
            <PokiXFee gasFee={gasFeeFormatted} preSavingsGasFee={pokiXGasFeeInfo?.preSavingsGasFeeFormatted} />
          ) : (
            <Text
              color={gasFee.isLoading ? '$neutral3' : showHighGasFeeUI ? '$statusCritical' : '$neutral1'}
              variant="body3"
            >
              {gasFeeFormatted}
            </Text>
          )}
        </Flex>
      </IndicativeLoadingWrapper>
    </Flex>
  )
}

type PokiXFeeProps = { gasFee: string; preSavingsGasFee?: string; smaller?: boolean }
export function PokiXFee({ gasFee, preSavingsGasFee, smaller = false }: PokiXFeeProps): JSX.Element {
  return (
    <Flex centered row>
      <PokiX marginEnd="$spacing2" size={smaller ? '$icon.12' : '$icon.16'} />
      <PokiXText mr="$spacing6" variant={smaller ? 'body4' : 'body3'}>
        {gasFee}
      </PokiXText>
      {preSavingsGasFee && (
        <Text color="$neutral2" textDecorationLine="line-through" variant={smaller ? 'body4' : 'body3'}>
          {preSavingsGasFee}
        </Text>
      )}
    </Flex>
  )
}
