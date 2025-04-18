import { TokenLogo } from 'poki/src/components/CurrencyLogo/TokenLogo'
import { ReactNode } from 'react'
import { Flex } from 'ui/src'
import { Shuffle } from 'ui/src/components/icons/Shuffle'
import { iconSizes, zIndexes } from 'ui/src/theme'
// import { CurrencyInfo } from 'poki/src/features/dataApi/types'

interface SplitLogosProps {
  // inputCurrencyInfo: Maybe<CurrencyInfo>
  // outputCurrencyInfo: Maybe<CurrencyInfo>
  inputLogoUrl?: string
  outputLogoUrl?: string
  size: number
  customIcon?: ReactNode
}

/*
 * Logo, where left 50% of width is taken from one icon (its left 50%)
 * and right side is taken from another icon (its right 50%)
 */
export function SplitLogos({ size, inputLogoUrl, outputLogoUrl, customIcon }: SplitLogosProps): JSX.Element {
  const iconSize = size / 2

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
        <TokenLogo hideNetworkLogo url={inputLogoUrl} size={size} />
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
        <TokenLogo hideNetworkLogo url={outputLogoUrl} size={size} />
      </Flex>
      {customIcon && (
        <Flex bottom={-4} position="absolute" right={-4} zIndex={zIndexes.mask}>
          {customIcon}
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
