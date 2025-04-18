import {
  ElementNameType,
  InterfacePageNameType,
  ModalNameType,
  SectionNameType,
} from 'poki/src/features/telemetry/constants'
import { UniverseEventProperties } from 'poki/src/features/telemetry/types'
import { ExtensionScreen } from 'poki/src/types/screens/extension'
import { MobileAppScreen } from 'poki/src/types/screens/mobile'
import { PropsWithChildren, memo } from 'react'
// eslint-disable-next-line no-restricted-imports
import { TraceProps, Trace as UntypedTrace } from 'utilities/src/telemetry/trace/Trace'

// Universe typed version of ITraceContext
interface UniverseTraceContext {
  page?: InterfacePageNameType
  screen?: MobileAppScreen | ExtensionScreen
  section?: SectionNameType
  modal?: ModalNameType
  element?: ElementNameType
}

type BaseTraceProps = UniverseTraceContext & Omit<TraceProps, 'eventOnTrigger' | 'properties'>

function _Trace<EventName extends keyof UniverseEventProperties | undefined>({
  children,
  eventOnTrigger,
  properties,
  logImpression,
  logPress,
  logFocus,
  logKeyPress,
  ...rest
}: PropsWithChildren<
  BaseTraceProps & {
    eventOnTrigger?: EventName
    properties?: EventName extends keyof UniverseEventProperties
      ? UniverseEventProperties[EventName]
      : Record<string, unknown>
  }
>): JSX.Element {
  const typedProps: Record<string, unknown> | undefined = properties
    ? (properties as Record<string, unknown>)
    : undefined

  return (
    <UntypedTrace
      eventOnTrigger={eventOnTrigger}
      logFocus={logFocus}
      logImpression={logImpression}
      logKeyPress={logKeyPress}
      logPress={logPress}
      properties={typedProps}
      {...rest}
    >
      {children}
    </UntypedTrace>
  )
}

const typedMemo: <T>(c: T) => T = memo
const Trace = typedMemo(_Trace)
export default Trace
