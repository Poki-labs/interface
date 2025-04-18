import { addWindowMessageListener } from 'src/background/messagePassing/messageUtils'
import { WindowEthereumProxy } from 'src/contentScript/WindowEthereumProxy'
import {
  ETH_PROVIDER_CONFIG,
  WindowEthereumConfigResponse,
  isValidContentScriptToProxyEmission,
  isValidWindowEthereumConfigResponse,
} from 'src/contentScript/types'
import { logger } from 'utilities/src/logger/logger'
import { v4 as uuid } from 'uuid'

// TODO(xtine): Get this working by importing the svg file directly. The svg text comes from packages/ui/src/assets/icons/poki-logo.svg
const POKI_LOGO =
  'data:image/png;base64,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'
const POKI_NAME = 'PokiWallet Extension'
const POKI_RDNS = 'org.poki.app'

declare global {
  interface Window {
    isStretchInstalled?: boolean
    ethereum?: unknown
  }
}

enum EIP6963EventNames {
  Announce = 'eip6963:announceProvider',
  Request = 'eip6963:requestProvider',
}

interface EIP6963ProviderInfo {
  uuid: string
  name: string
  icon: string
  rdns: string
}

const oldProvider = window.ethereum

const pokiWalletProvider = new WindowEthereumProxy()
window.ethereum = pokiWalletProvider

addWindowMessageListener(isValidContentScriptToProxyEmission, (message) => {
  logger.debug('ethereum.ts', `Emitting ${message.emitKey} via WindowEthereumProxy`, message.emitValue)
  pokiWalletProvider.emit(message.emitKey, message.emitValue)
})

const providerUuid = uuid()

function announceProvider(): void {
  const info: EIP6963ProviderInfo = {
    uuid: providerUuid,
    name: POKI_NAME,
    icon: POKI_LOGO,
    rdns: POKI_RDNS,
  }

  window.dispatchEvent(
    new CustomEvent(EIP6963EventNames.Announce, {
      detail: Object.freeze({ info, provider: pokiWalletProvider }),
    }),
  )
}

const handle6963Request = (event: Event): void => {
  if (!isValidRequestProviderEvent(event)) {
    throw new Error(
      `Invalid EIP-6963 RequestProviderEvent object received from ${EIP6963EventNames.Request} event. See https://eips.ethereum.org/EIPS/eip-6963 for requirements.`,
    )
  }

  announceProvider()
}

const create6963Listener = (): void => {
  // remove the old listener if present
  window.removeEventListener(EIP6963EventNames.Request, handle6963Request)

  window.addEventListener(EIP6963EventNames.Request, handle6963Request)

  announceProvider()
}

create6963Listener()

// override logic impl details in src/app/utils/provider.ts
// get config from sister content script
addWindowMessageListener<WindowEthereumConfigResponse>(
  isValidWindowEthereumConfigResponse,
  async (request) => {
    const isDefaultProvider = request.config.isDefaultProvider

    // if default provider is false, restore old provider for 1193 and unspoof 6963 provider
    if (isDefaultProvider === false) {
      pokiWalletProvider.isMetaMask = false
      if (oldProvider) {
        // typing isn't exact here but the idea is that we are injecting some 1193 provider
        window.ethereum = oldProvider
        create6963Listener()
      }
    }
  },
  undefined,
  { removeAfterHandled: true },
)

window.postMessage({ type: ETH_PROVIDER_CONFIG.REQUEST })

type EIP6963RequestProviderEvent = Event & {
  type: EIP6963EventNames.Request
}

function isValidRequestProviderEvent(event: unknown): event is EIP6963RequestProviderEvent {
  return event instanceof Event && event.type === EIP6963EventNames.Request
}
