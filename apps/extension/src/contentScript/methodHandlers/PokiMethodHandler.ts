import { JsonRpcProvider } from '@ethersproject/providers'
import { DappRequestType, DappResponseType } from 'src/app/features/dappRequests/types/DappRequestTypes'
import {
  contentScriptToBackgroundMessageChannel,
  dappResponseMessageChannel,
} from 'src/background/messagePassing/messageChannels'
import { OpenSidebarRequest, OpenSidebarRequestSchema } from 'src/contentScript/WindowEthereumRequestTypes'
import { BaseMethodHandler } from 'src/contentScript/methodHandlers/BaseMethodHandler'
import { PokiMethods } from 'src/contentScript/methodHandlers/requestMethods'
import { PendingResponseInfo } from 'src/contentScript/methodHandlers/types'
import { getPendingResponseInfo } from 'src/contentScript/methodHandlers/utils'
import { WindowEthereumRequest } from 'src/contentScript/types'
import { logger } from 'utilities/src/logger/logger'

/**
 * Handles all poki-specific requests
 */

export class PokiMethodHandler extends BaseMethodHandler<WindowEthereumRequest> {
  private readonly requestIdToSourceMap: Map<string, PendingResponseInfo> = new Map()

  constructor(
    getChainId: () => string | undefined,
    getProvider: () => JsonRpcProvider | undefined,
    getConnectedAddresses: () => Address[] | undefined,
    setChainIdAndMaybeEmit: (newChainId: string) => void,
    setProvider: (newProvider: JsonRpcProvider) => void,
    setConnectedAddressesAndMaybeEmit: (newConnectedAddresses: Address[]) => void,
  ) {
    super(
      getChainId,
      getProvider,
      getConnectedAddresses,
      setChainIdAndMaybeEmit,
      setProvider,
      setConnectedAddressesAndMaybeEmit,
    )

    dappResponseMessageChannel.addMessageListener(DappResponseType.OpenSidebarResponse, (message) => {
      const source = getPendingResponseInfo(
        this.requestIdToSourceMap,
        message.requestId,
        DappResponseType.OpenSidebarResponse,
      )?.source

      source?.postMessage({
        requestId: message.requestId,
      })
    })
  }

  async handleRequest(request: WindowEthereumRequest, source: MessageEventSource | null): Promise<void> {
    switch (request.method) {
      case PokiMethods.poki_openSidebar: {
        logger.debug("Handling 'poki_openSidebar' request", request.method, request.toString())
        const openTokensRequest = OpenSidebarRequestSchema.parse(request)
        await this.handleOpenSidebarRequest(openTokensRequest, source)
        break
      }
    }
  }

  private async handleOpenSidebarRequest(
    request: OpenSidebarRequest,
    source: MessageEventSource | null,
  ): Promise<void> {
    this.requestIdToSourceMap.set(request.requestId, {
      source,
      type: DappResponseType.OpenSidebarResponse,
    })

    await contentScriptToBackgroundMessageChannel.sendMessage({
      type: DappRequestType.OpenSidebar,
      requestId: request.requestId,
      tab: request.tab,
    })
  }
}
