import { InfoTooltipProps } from 'poki/src/components/tooltip/InfoTooltipProps'
import { PropsWithChildren } from 'react'
import { NotImplementedError } from 'utilities/src/errors'

export function InfoTooltip(_props: PropsWithChildren<InfoTooltipProps>): JSX.Element {
  throw new NotImplementedError('InfoTooltip')
}
