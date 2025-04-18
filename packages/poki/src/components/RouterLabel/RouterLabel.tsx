import { useSwapTxContext } from 'poki/src/features/transactions/swap/contexts/SwapTxContext'
import { isClassic, isPokiX } from 'poki/src/features/transactions/swap/utils/routing'
import { useTranslation } from 'react-i18next'
import { Flex, PokiXText } from 'ui/src'
import { PokiX } from 'ui/src/components/icons/PokiX'

export function RouterLabel(): JSX.Element | null {
  const { trade } = useSwapTxContext()
  const { t } = useTranslation()

  if (!trade) {
    return null
  }

  if (isPokiX(trade)) {
    return (
      <Flex row alignItems="center">
        <PokiX size="$icon.16" mr="$spacing2" />
        <PokiXText variant="body3">{t('pokix.label')}</PokiXText>
      </Flex>
    )
  }

  if (isClassic(trade)) {
    return <>Poki API</>
  }

  return null
}
