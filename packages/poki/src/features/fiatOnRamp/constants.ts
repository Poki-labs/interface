import { config } from 'poki/src/config'
import { pokiWalletUrls } from 'poki/src/constants/urls'
import { REQUEST_SOURCE, getVersionHeader } from 'poki/src/data/constants'
import { isMobileApp } from 'utilities/src/platform'

export const FOR_API_HEADERS = {
  'Content-Type': 'application/json',
  'X-API-KEY': config.pokiApiKey,
  'x-request-source': REQUEST_SOURCE,
  ...(isMobileApp ? { 'x-app-version': getVersionHeader() } : {}),
  Origin: pokiWalletUrls.requestOriginUrl,
}

export const FOR_MODAL_SNAP_POINTS = ['70%', '100%']
export const SERVICE_PROVIDER_ICON_SIZE = 90
export const SERVICE_PROVIDER_ICON_BORDER_RADIUS = 20

export const ServiceProviderLogoStyles = {
  icon: {
    height: SERVICE_PROVIDER_ICON_SIZE,
    width: SERVICE_PROVIDER_ICON_SIZE,
    borderRadius: SERVICE_PROVIDER_ICON_BORDER_RADIUS,
  },
  pokiLogoWrapper: {
    backgroundColor: '#FFEFF8', // #FFD8EF with 40% opacity on a white background
    borderRadius: SERVICE_PROVIDER_ICON_BORDER_RADIUS,
    height: SERVICE_PROVIDER_ICON_SIZE,
    width: SERVICE_PROVIDER_ICON_SIZE,
  },
}
