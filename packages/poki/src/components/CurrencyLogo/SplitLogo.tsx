import { CurrencyLogo, STATUS_RATIO } from 'poki/src/components/CurrencyLogo/CurrencyLogo'
import { TransactionSummaryNetworkLogo } from 'poki/src/components/CurrencyLogo/NetworkLogo'
import { TokenLogo } from 'poki/src/components/CurrencyLogo/TokenLogo'
import { UniverseChainId } from 'poki/src/features/chains/types'
import { CurrencyInfo } from 'poki/src/features/dataApi/types'
import { ReactNode } from 'react'
import { Flex } from 'ui/src'
import { Shuffle } from 'ui/src/components/icons/Shuffle'
import { iconSizes, zIndexes } from 'ui/src/theme'

interface Props {
  inputCurrencyInfo: Maybe<CurrencyInfo>
  outputCurrencyInfo: Maybe<CurrencyInfo>
  inputLogoUrl?: string
  outputLogoUrl?: string
  size: number
  chainId: UniverseChainId | null
  customIcon?: ReactNode
}

/*
 * Logo, where left 50% of width is taken from one icon (its left 50%)
 * and right side is taken from another icon (its right 50%)
 */
export function SplitLogo({
  size,
  inputCurrencyInfo,
  outputCurrencyInfo,
  inputLogoUrl,
  outputLogoUrl,
  chainId,
  customIcon,
}: Props): JSX.Element {
  const iconSize = size / 2
  const networkLogo =
    chainId && chainId !== UniverseChainId.Mainnet ? (
      <TransactionSummaryNetworkLogo chainId={chainId} size={size * STATUS_RATIO} />
    ) : undefined

  return (
    <Flex height={size} width={size}>
      <Flex
        left={0}
        overflow="hidden"
        position="absolute"
        testID="input-currency-logo-container"
        top={0}
        width={iconSize - 1 /* -1 to allow for space between the icons */}
      >
        {inputLogoUrl ? (
          <TokenLogo hideNetworkLogo url={inputLogoUrl} chainId={chainId ?? undefined} size={size} />
        ) : (
          <CurrencyLogo hideNetworkLogo currencyInfo={inputCurrencyInfo} size={size} />
        )}
      </Flex>
      <Flex
        flexDirection="row-reverse"
        overflow="hidden"
        position="absolute"
        right={0}
        testID="output-currency-logo-container"
        top={0}
        width={iconSize - 1 /* -1 to allow for space between the icons */}
      >
        {outputLogoUrl ? (
          <TokenLogo hideNetworkLogo url={outputLogoUrl} chainId={chainId ?? undefined} size={size} />
        ) : (
          <CurrencyLogo hideNetworkLogo currencyInfo={outputCurrencyInfo} size={size} />
        )}
      </Flex>
      {(customIcon || networkLogo) && (
        <Flex bottom={-4} position="absolute" right={-4} zIndex={zIndexes.mask}>
          {customIcon ?? networkLogo}
        </Flex>
      )}
    </Flex>
  )
}

export const BridgeIcon = (
  <Flex
    testID="bridge-icon"
    borderColor="$surface1"
    borderWidth="$spacing2"
    borderRadius="$roundedFull"
    overflow="hidden"
    backgroundColor="$statusSuccess"
    p="$spacing1"
  >
    <Shuffle size={iconSizes.icon12} color="$surface1" backgroundColor="$statusSuccess" />
  </Flex>
)
