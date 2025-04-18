import { DecimalPadProps } from 'poki/src/features/transactions/DecimalPadInput/types'
import { memo } from 'react'
import { NotImplementedError } from 'utilities/src/errors'

export const DecimalPad = memo(function DecimalPad(_props: DecimalPadProps): JSX.Element {
  throw new NotImplementedError('DecimalPad')
})
