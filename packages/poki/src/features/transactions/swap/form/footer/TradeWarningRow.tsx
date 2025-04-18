import { Warning } from 'poki/src/components/modals/WarningModal/types'
import { TouchableArea, TouchableAreaProps } from 'ui/src'

type TradeWarningRowProps = React.PropsWithChildren<TouchableAreaProps> & { warning: Warning }

export function TradeWarningRow(props: TradeWarningRowProps): JSX.Element {
  if (!props.warning.message) {
    return <>{props.children}</>
  }

  return <TouchableArea {...props} />
}
