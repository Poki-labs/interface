import { GasFeeResult } from 'poki/src/features/gas/types'
import { useTranslation } from 'react-i18next'
import { DappRequestContent } from 'src/app/features/dappRequests/DappRequestContent'
import { LPSendTransactionRequest } from 'src/app/features/dappRequests/types/DappRequestTypes'
import { Flex, Text } from 'ui/src'

interface LPRequestContentProps {
  transactionGasFeeResult: GasFeeResult
  dappRequest: LPSendTransactionRequest
  onCancel: () => Promise<void>
  onConfirm: () => Promise<void>
}

export function LPRequestContent({
  dappRequest,
  transactionGasFeeResult,
  onCancel,
  onConfirm,
}: LPRequestContentProps): JSX.Element {
  const { t } = useTranslation()

  return (
    <DappRequestContent
      showNetworkCost
      confirmText={t('common.button.sign')}
      title={t('dapp.request.base.title')}
      transactionGasFeeResult={transactionGasFeeResult}
      onCancel={onCancel}
      onConfirm={onConfirm}
    >
      <Flex
        alignItems="flex-start"
        backgroundColor="$surface2"
        borderColor="$surface3"
        borderRadius="$rounded16"
        borderWidth="$spacing1"
        flexDirection="row"
        justifyContent="space-between"
        p="$spacing16"
      >
        {dappRequest.parsedCalldata.commands.map((command) => (
          <Text color="$neutral2" variant="body4">
            {command.commandName}
          </Text>
        ))}
      </Flex>
    </DappRequestContent>
  )
}
