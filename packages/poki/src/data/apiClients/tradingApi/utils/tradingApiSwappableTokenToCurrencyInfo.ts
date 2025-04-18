import { toGqlSafetyLevel } from 'poki/src/components/TokenSelector/utils'
import { getNativeAddress } from 'poki/src/constants/addresses'
import { GetSwappableTokensResponse } from 'poki/src/data/tradingApi/__generated__'
import { toSupportedChainId } from 'poki/src/features/chains/utils'
import { CurrencyInfo } from 'poki/src/features/dataApi/types'
import { buildCurrency, getCurrencySafetyInfo } from 'poki/src/features/dataApi/utils'
import { NATIVE_ADDRESS_FOR_TRADING_API } from 'poki/src/features/transactions/swap/utils/tradingApi'
import { currencyId } from 'poki/src/utils/currencyId'

export function tradingApiSwappableTokenToCurrencyInfo(
  token: GetSwappableTokensResponse['tokens'][0],
): CurrencyInfo | undefined {
  const isNative = token.address === NATIVE_ADDRESS_FOR_TRADING_API
  const supportedChainId = toSupportedChainId(token.chainId)

  if (!supportedChainId) {
    return undefined
  }

  const currency = buildCurrency({
    chainId: supportedChainId,
    address: isNative ? getNativeAddress(supportedChainId) : token.address,
    decimals: token.decimals,
    symbol: token.symbol,
    name: token.name,
  })

  if (!currency) {
    return undefined
  }

  const safetyLevel = toGqlSafetyLevel(token.project.safetyLevel)

  const currencyInfo: CurrencyInfo = {
    currency,
    currencyId: currencyId(currency),
    logoUrl: token.project.logo?.url,
    isSpam: token.project.isSpam,
    safetyLevel,
    safetyInfo: getCurrencySafetyInfo(safetyLevel ?? undefined),
  }

  return currencyInfo
}
