import { getChainInfo } from 'poki/src/features/chains/chainInfo'
import { UniverseChainId } from 'poki/src/features/chains/types'
import { LocalizationContextState } from 'poki/src/features/language/LocalizationContext'
import { ValueType, getCurrencyAmount } from 'poki/src/features/tokens/getCurrencyAmount'
import { SerializedToken } from 'poki/src/features/tokens/slice/types'
import { Currency, Token } from 'poki/src/sdk-core'
import { getValidAddress } from 'poki/src/utils/addresses'
import { shortenAddress } from 'utilities/src/addresses'

const DEFAULT_MAX_SYMBOL_CHARACTERS = 6

export function getSymbolDisplayText(symbol: Maybe<string>): Maybe<string> {
  if (!symbol) {
    return symbol
  }

  return symbol.length > DEFAULT_MAX_SYMBOL_CHARACTERS
    ? symbol?.substring(0, DEFAULT_MAX_SYMBOL_CHARACTERS - 1) + '…'
    : symbol
}

export function wrappedNativeCurrency(chainId: UniverseChainId): Token {
  const wrappedCurrencyInfo = getChainInfo(chainId).wrappedNativeCurrency
  return new Token(
    chainId,
    wrappedCurrencyInfo.address,
    wrappedCurrencyInfo.decimals,
    wrappedCurrencyInfo.symbol,
    wrappedCurrencyInfo.name,
  )
}

export function serializeToken(token: Token): SerializedToken {
  return {
    chainId: token.chainId,
    address: token.address,
    decimals: token.decimals,
    name: token.name,
    symbol: token.symbol,
  }
}

export function deserializeToken(serializedToken: SerializedToken): Token {
  return new Token(
    serializedToken.chainId,
    serializedToken.address,
    serializedToken.decimals,
    serializedToken.symbol,
    serializedToken.name,
  )
}

export function getFormattedCurrencyAmount(
  currency: Maybe<Currency>,
  currencyAmountRaw: string,
  formatter: LocalizationContextState,
  isApproximateAmount = false,
  valueType = ValueType.Raw,
): string {
  const currencyAmount = getCurrencyAmount({
    value: currencyAmountRaw,
    valueType,
    currency,
  })

  if (!currencyAmount) {
    return ''
  }

  const formattedAmount = formatter.formatCurrencyAmount({ value: currencyAmount })
  return isApproximateAmount ? `~${formattedAmount} ` : `${formattedAmount} `
}

export function getCurrencyDisplayText(
  currency: Maybe<Currency>,
  tokenAddressString: Address | undefined,
): string | undefined {
  const symbolDisplayText = getSymbolDisplayText(currency?.symbol)

  if (symbolDisplayText) {
    return symbolDisplayText
  }

  return tokenAddressString && getValidAddress(tokenAddressString, true)
    ? shortenAddress(tokenAddressString)
    : tokenAddressString
}
