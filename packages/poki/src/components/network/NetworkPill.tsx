import { NetworkLogo } from 'poki/src/components/CurrencyLogo/NetworkLogo'
import { Pill } from 'poki/src/components/pill/Pill'
import { UniverseChainId } from 'poki/src/features/chains/types'
import { getChainLabel } from 'poki/src/features/chains/utils'
import { useNetworkColors } from 'poki/src/utils/colors'
import { ComponentProps } from 'react'
import { iconSizes } from 'ui/src/theme'

export type NetworkPillProps = {
  chainId: UniverseChainId
  showBackgroundColor?: boolean
  showBorder?: boolean
  showIcon?: boolean
  iconSize?: number
} & ComponentProps<typeof Pill>

export function NetworkPill({
  chainId,
  showBackgroundColor = true,
  showBorder,
  showIcon = false,
  iconSize = iconSizes.icon16,
  ...rest
}: NetworkPillProps): JSX.Element {
  const label = getChainLabel(chainId)
  const colors = useNetworkColors(chainId)

  return (
    <Pill
      customBackgroundColor={showBackgroundColor ? colors?.background : undefined}
      customBorderColor={showBorder ? colors.foreground : 'transparent'}
      foregroundColor={colors.foreground}
      icon={showIcon ? <NetworkLogo chainId={chainId} size={iconSize} /> : null}
      label={label}
      {...rest}
    />
  )
}

export function InlineNetworkPill(props: NetworkPillProps): JSX.Element {
  return <NetworkPill borderRadius="$rounded8" px="$spacing4" py="$none" textVariant="buttonLabel3" {...props} />
}
