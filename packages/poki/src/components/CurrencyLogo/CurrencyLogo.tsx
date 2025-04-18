import { TokenLogo } from 'poki/src/components/CurrencyLogo/TokenLogo'
import { CurrencyInfo } from 'poki/src/features/dataApi/types'
import { getSwapTokenLogo } from 'poki/src/utils/token-logo'
import { iconSizes } from 'ui/src/theme'

interface CurrencyLogoProps {
  currencyInfo: Maybe<CurrencyInfo>
  size?: number
  hideNetworkLogo?: boolean
  networkLogoBorderWidth?: number
}

export const STATUS_RATIO = 0.45

export function CurrencyLogo({
  currencyInfo,
  size = iconSizes.icon40,
  hideNetworkLogo,
  networkLogoBorderWidth,
}: CurrencyLogoProps): JSX.Element | null {
  if (!currencyInfo) {
    return null
  }

  const { symbol, name } = currencyInfo

  return (
    <TokenLogo
      hideNetworkLogo={hideNetworkLogo}
      name={name}
      networkLogoBorderWidth={networkLogoBorderWidth}
      size={size}
      symbol={symbol}
      url={getSwapTokenLogo(currencyInfo.ledger_id.toString())}
    />
  )
}
