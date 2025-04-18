import { getNativeAddress } from 'poki/src/constants/addresses'
import { UniverseChainId } from 'poki/src/features/chains/types'
import { buildCurrencyId, currencyIdToGraphQLAddress } from 'poki/src/utils/currencyId'

export const BACKEND_NATIVE_CHAIN_ADDRESS_STRING = 'NATIVE'

export function tokenAddressOrNativeAddress(address: string, chainId: UniverseChainId): string | null {
  const nativeAddress = getNativeAddress(chainId)

  if (address !== BACKEND_NATIVE_CHAIN_ADDRESS_STRING && address !== nativeAddress) {
    return address
  }

  return currencyIdToGraphQLAddress(buildCurrencyId(chainId, nativeAddress))
}
