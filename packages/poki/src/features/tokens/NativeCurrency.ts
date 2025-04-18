// adapted from https://github.com/Poki/interface/src/constants/tokens.ts
import { getNativeAddress } from 'poki/src/constants/addresses'
import { getChainInfo } from 'poki/src/features/chains/chainInfo'
import { UniverseChainId } from 'poki/src/features/chains/types'
import { toSupportedChainId } from 'poki/src/features/chains/utils'
import { Currency, NativeCurrency as NativeCurrencyClass, Token } from 'poki/src/sdk-core'
import { wrappedNativeCurrency } from 'poki/src/utils/currency'

export class NativeCurrency implements NativeCurrencyClass {
  constructor(chainId: number) {
    const supportedChainId = toSupportedChainId(chainId)
    if (!supportedChainId) {
      throw new Error(`Unsupported chain ID: ${chainId}`)
    }

    const { nativeCurrency } = getChainInfo(supportedChainId)

    this.chainId = supportedChainId
    this.decimals = nativeCurrency.decimals
    this.name = nativeCurrency.name
    this.symbol = nativeCurrency.symbol
    this.isNative = true
    this.isToken = false
    this.address = getNativeAddress(this.chainId)
  }

  chainId: UniverseChainId
  decimals: number
  name: string
  symbol: string
  isNative: true
  isToken: false
  address: string

  equals(currency: Currency): boolean {
    return currency.isNative && currency.chainId === this.chainId
  }

  public get wrapped(): Token {
    return wrappedNativeCurrency(this.chainId)
  }

  private static _cachedNativeCurrency: { [chainId: number]: NativeCurrency } = {}

  public static onChain(chainId: number): NativeCurrency {
    return this._cachedNativeCurrency[chainId] ?? (this._cachedNativeCurrency[chainId] = new NativeCurrency(chainId))
  }
}
