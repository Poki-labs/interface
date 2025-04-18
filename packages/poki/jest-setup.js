import 'ui/jest-package-mocks'
import 'poki/jest-package-mocks'
import 'utilities/jest-package-mocks'

import 'poki/src/i18n' // Uses real translations for tests

jest.mock('poki/src/features/transactions/settings/contexts/TransactionSettingsContext', () => {
  return {
    useTransactionSettingsContext: () => ({
      customDeadline: 20,
      customSlippage: 0.5,
    }),
  }
})

// Use native modal
jest.mock('poki/src/components/modals/Modal', () => {
  return jest.requireActual('poki/src/components/modals/Modal.native.tsx')
})

// Mock the browser's performance API
global.performance = require('perf_hooks').performance

jest.mock('utilities/src/telemetry/trace/utils/calculateElapsedTimeWithPerformanceMarkMs', () => {
  return jest.requireActual('utilities/src/telemetry/trace/utils/calculateElapsedTimeWithPerformanceMarkMs.web.ts')
})
