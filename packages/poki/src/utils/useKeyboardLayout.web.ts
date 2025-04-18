import { KeyboardLayout } from 'poki/src/utils/useKeyboardLayout'
import { NotImplementedError } from 'utilities/src/errors'

export function useKeyboardLayout(): KeyboardLayout {
  throw new NotImplementedError('useKeyboardLayout')
}
