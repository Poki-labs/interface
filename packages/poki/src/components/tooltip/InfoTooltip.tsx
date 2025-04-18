import { InfoTooltipProps } from 'poki/src/components/tooltip/InfoTooltipProps'
import { PropsWithChildren } from 'react'
import { PlatformSplitStubError } from 'utilities/src/errors'

export function InfoTooltip(_props: PropsWithChildren<InfoTooltipProps>): JSX.Element {
  throw new PlatformSplitStubError('InfoTooltip')
}
