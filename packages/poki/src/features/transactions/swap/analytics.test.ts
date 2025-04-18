import { SwapEventName } from 'analytics-events/src/index'
import { sendAnalyticsEvent } from 'poki/src/features/telemetry/send'
import { logSwapQuoteFetch } from 'poki/src/features/transactions/swap/analytics'

jest.mock('poki/src/features/telemetry/send', () => ({
  sendAnalyticsEvent: jest.fn(),
}))

jest.mock('poki/src/features/transactions/swap/utils/SwapEventTimestampTracker', () => ({
  ...jest.requireActual('poki/src/features/transactions/swap/utils/SwapEventTimestampTracker'),
  timestampTracker: {
    hasTimestamp: (): boolean => false,
    setElapsedTime: (): number => 100,
    getElapsedTime: (): number => 100,
  },
}))

describe('analytics', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  it('logSwapQuoteRequest calls sendAnalyticsEvent with correct parameters', () => {
    const mockChainId = 1

    logSwapQuoteFetch({ chainId: mockChainId })

    expect(sendAnalyticsEvent).toHaveBeenCalledWith(SwapEventName.SWAP_QUOTE_FETCH, {
      chainId: mockChainId,
      isQuickRoute: false,
      time_to_first_quote_request: 100,
      time_to_first_quote_request_since_first_input: 100,
    })
  })

  it('logSwapQuoteRequest excludes perf metrics for price quotes', () => {
    const mockChainId = 1

    logSwapQuoteFetch({ chainId: mockChainId, isUSDQuote: true })

    expect(sendAnalyticsEvent).toHaveBeenCalledWith(SwapEventName.SWAP_QUOTE_FETCH, {
      chainId: mockChainId,
      isQuickRoute: false,
    })
  })
})
