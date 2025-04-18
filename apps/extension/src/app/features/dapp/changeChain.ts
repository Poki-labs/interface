import { JsonRpcProvider } from '@ethersproject/providers'
import { providerErrors, serializeError } from '@metamask/rpc-errors'
import { UniverseChainId } from 'poki/src/features/chains/types'
import { chainIdToHexadecimalString } from 'poki/src/features/chains/utils'
import { ExtensionEventName } from 'poki/src/features/telemetry/constants'
import { sendAnalyticsEvent } from 'poki/src/features/telemetry/send'
import { dappStore } from 'src/app/features/dapp/store'
import {
  ChangeChainResponse,
  DappResponseType,
  ErrorResponse,
} from 'src/app/features/dappRequests/types/DappRequestTypes'

export function changeChain({
  activeConnectedAddress,
  dappUrl,
  provider,
  requestId,
  updatedChainId,
}: {
  activeConnectedAddress: Address | undefined
  dappUrl: string | undefined
  provider: JsonRpcProvider | undefined | null
  requestId: string
  updatedChainId: UniverseChainId | null
}): ChangeChainResponse | ErrorResponse {
  if (!updatedChainId) {
    return {
      type: DappResponseType.ErrorResponse,
      error: serializeError(
        providerErrors.custom({
          code: 4902,
          message: 'Poki Wallet does not support switching to this chain.',
        }),
      ),
      requestId,
    }
  }

  if (!provider) {
    return {
      type: DappResponseType.ErrorResponse,
      error: serializeError(providerErrors.unauthorized()),
      requestId,
    }
  }

  if (dappUrl) {
    dappStore.updateDappLatestChainId(dappUrl, updatedChainId)
    sendAnalyticsEvent(ExtensionEventName.DappChangeChain, {
      dappUrl: dappUrl ?? '',
      chainId: updatedChainId,
      activeConnectedAddress: activeConnectedAddress ?? '',
    })

    return {
      type: DappResponseType.ChainChangeResponse,
      requestId,
      providerUrl: provider.connection.url,
      chainId: chainIdToHexadecimalString(updatedChainId),
    }
  }

  return {
    type: DappResponseType.ErrorResponse,
    error: serializeError(providerErrors.unauthorized()),
    requestId,
  }
}
