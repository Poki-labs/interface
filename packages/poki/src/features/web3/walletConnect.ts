import { CONNECTION_PROVIDER_IDS } from 'poki/src/constants/web3'
import { UniverseChainId } from 'poki/src/features/chains/types'
import { Connector } from 'wagmi'

export interface WalletConnectConnector extends Connector {
  type: typeof CONNECTION_PROVIDER_IDS.POKI_WALLET_CONNECT_CONNECTOR_ID
  getNamespaceChainsIds: () => UniverseChainId[]
  getProvider(): Promise<{ modal: { setTheme: ({ themeMode }: { themeMode: 'dark' | 'light' }) => void } }>
}
