/* eslint-disable max-lines */
import { UniverseChainId } from 'poki/src/features/chains/types'
import { NativeCurrency, Token } from 'poki/src/sdk-core'

export const WRAPPED_NATIVE_CURRENCY: { [chainId: number]: Token } = {}

export function isCelo(chainId: number): chainId is UniverseChainId.Celo {
  return chainId === UniverseChainId.Celo
}

// Celo has a precompile for its native asset that is fully-compliant with ERC20 interface
// so we can treat it as an ERC20 token. (i.e. $CELO pools are created with its ERC20 precompile)
function getCeloNativeCurrency(chainId: number): Token {
  switch (chainId) {
    case UniverseChainId.Celo:
      return CELO_CELO
    default:
      throw new Error('Not celo')
  }
}

export function isPolygon(chainId: number): chainId is UniverseChainId.Polygon {
  return chainId === UniverseChainId.Polygon
}

export function isBsc(chainId: number): chainId is UniverseChainId.Bnb {
  return chainId === UniverseChainId.Bnb
}

export function isAvalanche(chainId: number): chainId is UniverseChainId.Avalanche {
  return chainId === UniverseChainId.Avalanche
}

function isMonadTestnet(chainId: number): chainId is UniverseChainId.MonadTestnet {
  return chainId === UniverseChainId.MonadTestnet
}

const cachedNativeCurrency: { [chainId: number]: NativeCurrency | Token } = {}
export function nativeOnChain(chainId: number): NativeCurrency | Token {
  if (cachedNativeCurrency[chainId]) {
    return cachedNativeCurrency[chainId] as NativeCurrency
  }

  return (cachedNativeCurrency[chainId] = nativeCurrency)
}

export const DEFAULT_TAG_TOKENS = [
  'ryjl3-tyaaa-aaaaa-aaaba-cai',
  'xevnm-gaaaa-aaaar-qafnq-cai',
  'ss2fx-dyaaa-aaaar-qacoq-cai',
  'cngnf-vqaaa-aaaar-qag4q-cai',
  'mxzaz-hqaaa-aaaar-qaada-cai',
]
