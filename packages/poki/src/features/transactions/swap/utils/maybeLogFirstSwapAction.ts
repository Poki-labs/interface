import { SwapEventName } from 'analytics-events/src/index'
import { sendAnalyticsEvent } from 'poki/src/features/telemetry/send'
import { SwapEventType, timestampTracker } from 'poki/src/features/transactions/swap/utils/SwapEventTimestampTracker'
import { ITraceContext } from 'utilities/src/telemetry/trace/TraceContext'

// We only log the time-to-first-swap-input metric for the first swap input of a session.
export function maybeLogFirstSwapAction(analyticsContext: ITraceContext): void {
  if (timestampTracker.hasTimestamp(SwapEventType.FirstSwapAction)) {
    return
  }

  const elapsedTime = timestampTracker.setElapsedTime(SwapEventType.FirstSwapAction)

  sendAnalyticsEvent(SwapEventName.SWAP_FIRST_ACTION, {
    time_to_first_swap_action: elapsedTime,
    ...analyticsContext,
  })
}
