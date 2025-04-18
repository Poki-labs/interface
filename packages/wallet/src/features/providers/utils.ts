import { getChainInfo } from 'poki/src/features/chains/chainInfo'
import { RPCType, UniverseChainId } from 'poki/src/features/chains/types'

export function isPrivateRpcSupportedOnChain(chainId: UniverseChainId): boolean {
  return Boolean(getChainInfo(chainId).rpcUrls?.[RPCType.Private])
}
