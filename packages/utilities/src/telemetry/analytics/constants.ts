import { SharedEventName, SwapEventName } from 'analytics-events/src/index'

export const DUMMY_KEY = '00000000000000000000000000000000'

export const ALLOW_ANALYTICS_ATOM_KEY = 'allow_analytics'

export const AMPLITUDE_SHARED_TRACKING_OPTIONS = {
  country: false,
  city: false,
  dma: false, // designated market area
  ipAddress: false,
  region: false,
}

export const AMPLITUDE_NATIVE_TRACKING_OPTIONS = {
  adid: false,
  carrier: false,
}

export const ANONYMOUS_EVENT_NAMES: string[] = [
  SharedEventName.ANALYTICS_SWITCH_TOGGLED.valueOf(),
  SharedEventName.HEARTBEAT.valueOf(),
  SwapEventName.SWAP_TRANSACTION_COMPLETED.valueOf(),
]
