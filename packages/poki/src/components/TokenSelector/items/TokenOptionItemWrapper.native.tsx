import { TokenItemWrapperProps } from 'poki/src/components/TokenSelector/types'
import { Fragment } from 'react'

export function TokenOptionItemWrapper({ children }: TokenItemWrapperProps): JSX.Element {
  return <Fragment>{children}</Fragment>
}
