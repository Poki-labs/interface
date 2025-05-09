import DeviceInfo from 'react-native-device-info'

const BUNDLE_ID = DeviceInfo.getBundleId()

export function isPlaywrightEnv(): boolean {
  return false
}

export function isTestEnv(): boolean {
  return !!process.env.JEST_WORKER_ID || process.env.NODE_ENV === 'test'
}

export function isDevEnv(): boolean {
  return BUNDLE_ID.endsWith('.dev')
}

export function isBetaEnv(): boolean {
  return BUNDLE_ID.endsWith('.beta')
}

export function isProdEnv(): boolean {
  return BUNDLE_ID === 'com.poki.mobile'
}

export function isRNDev(): boolean {
  return __DEV__
}
