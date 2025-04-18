import { isAndroid, isExtension, isIOS } from 'utilities/src/platform'

export const ROUTING_API_PATH = '/v2/quote'

export const REQUEST_SOURCE = getRequestSource()

function getRequestSource(): string {
  if (isIOS) {
    return 'poki-ios'
  }
  if (isAndroid) {
    return 'poki-android'
  }
  if (isExtension) {
    return 'poki-extension'
  }
  return 'poki-web'
}

export { getVersionHeader } from './getVersionHeader'
