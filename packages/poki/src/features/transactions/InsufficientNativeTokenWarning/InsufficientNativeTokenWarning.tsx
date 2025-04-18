import { CurrencyLogo } from 'poki/src/components/CurrencyLogo/CurrencyLogo'
import { WarningModal } from 'poki/src/components/modals/WarningModal/WarningModal'
import { Warning } from 'poki/src/components/modals/WarningModal/types'
import { LearnMoreLink } from 'poki/src/components/text/LearnMoreLink'
import { pokiWalletUrls } from 'poki/src/constants/urls'
import { useAccountMeta } from 'poki/src/contexts/PokiContext'
import { useBridgingTokenWithHighestBalance } from 'poki/src/features/bridging/hooks/tokens'
import { UniverseChainId } from 'poki/src/features/chains/types'
import { CurrencyInfo } from 'poki/src/features/dataApi/types'
import { GasFeeResult } from 'poki/src/features/gas/types'
import { ModalName } from 'poki/src/features/telemetry/constants'
import { BridgeTokenButton } from 'poki/src/features/transactions/InsufficientNativeTokenWarning/BridgeTokenButton'
import { BuyNativeTokenButton } from 'poki/src/features/transactions/InsufficientNativeTokenWarning/BuyNativeTokenButton'
import { InsufficientNativeTokenBaseComponent } from 'poki/src/features/transactions/InsufficientNativeTokenWarning/InsufficientNativeTokenBaseComponent'
import { useInsufficientNativeTokenWarning } from 'poki/src/features/transactions/InsufficientNativeTokenWarning/useInsufficientNativeTokenWarning'
import { Currency } from 'poki/src/sdk-core'
import { currencyIdToAddress } from 'poki/src/utils/currencyId'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Flex, Text, TouchableArea } from 'ui/src'
import { logger } from 'utilities/src/logger/logger'

export function InsufficientNativeTokenWarning({
  warnings,
  flow,
  gasFee,
}: {
  warnings: Warning[]
  flow: 'send' | 'swap'
  gasFee: GasFeeResult
}): JSX.Element | null {
  const parsedInsufficentNativeTokenWarning = useInsufficientNativeTokenWarning({
    warnings,
    flow,
    gasFee,
  })

  const { nativeCurrency, nativeCurrencyInfo } = parsedInsufficentNativeTokenWarning ?? {}

  const address = useAccountMeta()?.address

  if (!parsedInsufficentNativeTokenWarning || !nativeCurrencyInfo || !nativeCurrency) {
    return null
  }

  if (!address) {
    logger.error(new Error('Unexpected render of `InsufficientNativeTokenWarning` without an active address'), {
      tags: {
        file: 'InsufficientNativeTokenWarning.tsx',
        function: 'InsufficientNativeTokenWarning',
      },
    })
    return null
  }

  return (
    <InsufficientNativeTokenWarningContent
      address={address}
      parsedInsufficentNativeTokenWarning={parsedInsufficentNativeTokenWarning}
      nativeCurrencyInfo={nativeCurrencyInfo}
      nativeCurrency={nativeCurrency}
    />
  )
}

function InsufficientNativeTokenWarningContent({
  address,
  parsedInsufficentNativeTokenWarning,
  nativeCurrencyInfo,
  nativeCurrency,
}: {
  address: Address
  parsedInsufficentNativeTokenWarning: NonNullable<ReturnType<typeof useInsufficientNativeTokenWarning>>
  nativeCurrencyInfo: CurrencyInfo
  nativeCurrency: Currency
}): JSX.Element {
  const { t } = useTranslation()
  const [showModal, setShowModal] = useState(false)

  const { networkName, modalOrTooltipMainMessage } = parsedInsufficentNativeTokenWarning

  const currencyAddress = currencyIdToAddress(nativeCurrencyInfo.currencyId)

  const bridgingTokenWithHighestBalance = useBridgingTokenWithHighestBalance({
    address,
    currencyAddress,
    currencyChainId: nativeCurrencyInfo.currency.chainId,
  })

  const shouldShowNetworkName = nativeCurrency.symbol === 'ETH' && nativeCurrency.chainId !== UniverseChainId.Mainnet

  const onClose = (): void => {
    setShowModal(false)
  }

  return (
    <>
      <TouchableArea onPress={(): void => setShowModal(true)}>
        <InsufficientNativeTokenBaseComponent
          parsedInsufficentNativeTokenWarning={parsedInsufficentNativeTokenWarning}
        />
      </TouchableArea>

      {showModal && (
        <WarningModal
          isOpen
          backgroundIconColor={false}
          icon={<CurrencyLogo currencyInfo={nativeCurrencyInfo} />}
          modalName={ModalName.SwapWarning}
          title={
            shouldShowNetworkName
              ? t('transaction.warning.insufficientGas.modal.title.withNetwork', {
                  // FIXME: Verify WALL-5906
                  tokenSymbol: nativeCurrency.symbol ?? '',
                  networkName,
                })
              : t('transaction.warning.insufficientGas.modal.title.withoutNetwork', {
                  // FIXME: Verify WALL-5906
                  tokenSymbol: nativeCurrency.symbol ?? '',
                })
          }
          onClose={onClose}
        >
          <Flex centered gap="$spacing24" width="100%">
            <Text color="$neutral2" textAlign="center" variant="body3">
              {modalOrTooltipMainMessage}
            </Text>

            <LearnMoreLink
              textColor="$accent3"
              textVariant="buttonLabel3"
              url={pokiWalletUrls.helpArticleUrls.networkFeeInfo}
            />

            <Flex gap="$spacing8" width="100%">
              {bridgingTokenWithHighestBalance && (
                <BridgeTokenButton
                  inputToken={bridgingTokenWithHighestBalance.currencyInfo}
                  outputToken={nativeCurrencyInfo}
                  outputNetworkName={networkName}
                  onPress={onClose}
                />
              )}

              <BuyNativeTokenButton
                nativeCurrencyInfo={nativeCurrencyInfo}
                canBridge={!!bridgingTokenWithHighestBalance}
                onPress={onClose}
              />
            </Flex>
          </Flex>
        </WarningModal>
      )}
    </>
  )
}
