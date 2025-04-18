import { useAccountMeta } from 'poki/src/contexts/PokiContext'
import { InsufficientNativeTokenWarning } from 'poki/src/features/transactions/InsufficientNativeTokenWarning/InsufficientNativeTokenWarning'
import { BlockedAddressWarning } from 'poki/src/features/transactions/modals/BlockedAddressWarning'
import { TradeInfoRow, useDebouncedGasInfo } from 'poki/src/features/transactions/swap/form/footer/TradeInfoRow'
import { useParsedSwapWarnings } from 'poki/src/features/transactions/swap/hooks/useSwapWarnings'
import { useIsBlocked } from 'poki/src/features/trm/hooks'
import { Flex } from 'ui/src'

export function GasAndWarningRows(): JSX.Element {
  const account = useAccountMeta()

  const { isBlocked } = useIsBlocked(account?.address)

  const { formScreenWarning, warnings } = useParsedSwapWarnings()
  const inlineWarning =
    formScreenWarning && formScreenWarning.displayedInline && !isBlocked ? formScreenWarning.warning : undefined

  const debouncedGasInfo = useDebouncedGasInfo()

  return (
    <>
      {/*
        Do not add any margins directly to this container, as this component is used in 2 different places.
        Adjust the margin in the parent component instead.
      */}
      <Flex gap="$spacing12">
        {isBlocked && (
          // TODO: review design of this warning.
          <BlockedAddressWarning
            row
            alignItems="center"
            alignSelf="stretch"
            backgroundColor="$surface2"
            borderBottomLeftRadius="$rounded16"
            borderBottomRightRadius="$rounded16"
            flexGrow={1}
            px="$spacing16"
            py="$spacing12"
          />
        )}

        <Flex gap="$spacing8" px="$spacing8" py="$spacing4">
          <TradeInfoRow gasInfo={debouncedGasInfo} warning={inlineWarning} />
        </Flex>

        <InsufficientNativeTokenWarning flow="swap" gasFee={debouncedGasInfo.gasFee} warnings={warnings} />
      </Flex>
    </>
  )
}
