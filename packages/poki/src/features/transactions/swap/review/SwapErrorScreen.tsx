import { WarningModalContent } from 'poki/src/components/modals/WarningModal/WarningModal'
import { WarningSeverity } from 'poki/src/components/modals/WarningModal/types'
import { pokiWalletUrls } from 'poki/src/constants/urls'
import { ProtocolItems } from 'poki/src/data/tradingApi/__generated__'
import { ModalName } from 'poki/src/features/telemetry/constants'
import { TransactionModalInnerContainer } from 'poki/src/features/transactions/TransactionModal/TransactionModal'
import { useTransactionModalContext } from 'poki/src/features/transactions/TransactionModal/TransactionModalContext'
import { TransactionStepFailedError, getErrorContent } from 'poki/src/features/transactions/errors'
import { useTransactionSettingsContext } from 'poki/src/features/transactions/settings/contexts/TransactionSettingsContext'
import { TransactionStepType } from 'poki/src/features/transactions/swap/types/steps'
import { openUri } from 'poki/src/utils/linking'
import { useTranslation } from 'react-i18next'
import { DeprecatedButton, Flex, Text, TouchableArea, isWeb } from 'ui/src'
import { HelpCenter } from 'ui/src/components/icons/HelpCenter'
import { X } from 'ui/src/components/icons/X'

export function SwapErrorScreen({
  submissionError,
  setSubmissionError,
  resubmitSwap,
  onClose,
}: {
  submissionError: Error
  setSubmissionError: (e: Error | undefined) => void
  resubmitSwap: () => void
  onClose: () => void
}): JSX.Element {
  const { t } = useTranslation()
  const { bottomSheetViewStyles } = useTransactionModalContext()
  const { updateTransactionSettings, selectedProtocols } = useTransactionSettingsContext()

  const { title, message, supportArticleURL } = getErrorContent(t, submissionError)

  const isPokiXBackendError =
    submissionError instanceof TransactionStepFailedError &&
    submissionError.isBackendRejection &&
    submissionError.step.type === TransactionStepType.PokiXSignature

  const handleTryAgain = (): void => {
    if (isPokiXBackendError) {
      // Update swap preferences for this session to exclude PokiX if Poki x failed
      const updatedProtocols = selectedProtocols.filter((protocol) => protocol !== ProtocolItems.POKIX_V2)
      updateTransactionSettings({ selectedProtocols: updatedProtocols })
    } else {
      resubmitSwap()
    }
    setSubmissionError(undefined)
  }

  const onPressGetHelp = async (): Promise<void> => {
    await openUri(supportArticleURL ?? pokiWalletUrls.helpUrl)
  }

  return (
    <TransactionModalInnerContainer bottomSheetViewStyles={bottomSheetViewStyles} fullscreen={false}>
      <Flex gap="$spacing16">
        {isWeb && (
          <Flex row justifyContent="flex-end" m="$spacing12" gap="$spacing12">
            <TouchableArea
              hoverable
              p="$padding6"
              borderColor="$surface3"
              borderWidth="$spacing1"
              borderRadius="$rounded12"
              onPress={onPressGetHelp}
            >
              <Flex row centered gap="$spacing4">
                <HelpCenter color="$neutral1" size="$icon.16" />{' '}
                <Text variant="body4" color="$neutral1">
                  {t('common.getHelp.button')}
                </Text>
              </Flex>
            </TouchableArea>
            <DeprecatedButton
              backgroundColor="$transparent"
              color="$neutral2"
              icon={<X size="$icon.20" />}
              p="$none"
              theme="secondary"
              onPress={onClose}
            />
          </Flex>
        )}
        <Flex animation="quick" enterStyle={{ opacity: 0 }} exitStyle={{ opacity: 0 }}>
          <WarningModalContent
            modalName={ModalName.SwapError}
            title={title}
            caption={message}
            severity={WarningSeverity.Low}
            rejectText={t('common.button.tryAgain')}
            onReject={handleTryAgain}
          />
        </Flex>
      </Flex>
    </TransactionModalInnerContainer>
  )
}
