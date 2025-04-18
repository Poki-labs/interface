import { WrapCallback, WrapCallbackParams } from 'poki/src/features/transactions/swap/types/wrapCallback'
import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { tokenWrapActions } from 'wallet/src/features/transactions/swap/wrapSaga'

export function useWrapCallback(): WrapCallback {
  const appDispatch = useDispatch()

  return useCallback(
    ({ onSuccess, ...params }: WrapCallbackParams) => {
      appDispatch(tokenWrapActions.trigger(params))
      onSuccess()
    },
    [appDispatch],
  )
}
