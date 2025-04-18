import 'poki/jest-package-mocks'
import 'ui/jest-package-mocks'
import 'utilities/jest-package-mocks'
import 'wallet/jest-package-mocks'

import 'poki/src/i18n' // Uses real translations for tests

jest.mock('poki/src/features/gas/hooks', () => ({
  useActiveGasStrategy: jest.fn().mockReturnValue({
    limitInflationFactor: 1.15,
    displayLimitInflationFactor: 1,
    priceInflationFactor: 1.5,
    percentileThresholdFor1559Fee: 75,
  }),
  useShadowGasStrategies: jest.fn().mockReturnValue([]),
}))

// Use web unicon
jest.mock('ui/src/components/Unicon', () => {
  return jest.requireActual('ui/src/components/Unicon/index.web.tsx')
})

// Use native modal
jest.mock('poki/src/components/modals/Modal', () => {
  return jest.requireActual('poki/src/components/modals/Modal.native.tsx')
})

// Use native clickable
jest.mock('ui/src/components/swipeablecards/ClickableWithinGesture', () => {
  return jest.requireActual('ui/src/components/swipeablecards/ClickableWithinGesture.native.tsx')
})

import crypto from 'crypto'
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: (arr) => crypto.randomBytes(arr.length),
    subtle: crypto.webcrypto.subtle,
  },
})
