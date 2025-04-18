// eslint-disable-next-line no-restricted-imports
import { useTestnetModeBannerHeight } from 'poki/src/features/settings/hooks'
import { useDeviceInsets } from 'ui/src/hooks/useDeviceInsets'

export const useAppInsets = (): {
  top: number
  right: number
  bottom: number
  left: number
} => {
  const insets = useDeviceInsets()

  const testnetBannerInset = useTestnetModeBannerHeight()

  return { ...insets, top: insets.top + testnetBannerInset }
}
