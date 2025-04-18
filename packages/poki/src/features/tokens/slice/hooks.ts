import { dismissedWarningTokensSelector, tagTokensSelector } from 'poki/src/features/tokens/slice/selectors'
import { addTagTokens, deleteTagTokens, dismissTokenWarning } from 'poki/src/features/tokens/slice/slice'
import { BasicTokenInfo, isBasicTokenInfo } from 'poki/src/features/tokens/slice/types'
import { Currency } from 'poki/src/sdk-core'
import { getValidAddress } from 'poki/src/utils/addresses'
import { serializeToken } from 'poki/src/utils/currency'
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

export function useDismissedTokenWarnings(info: Maybe<Currency | BasicTokenInfo>): {
  tokenWarningDismissed: boolean // user dismissed warning
  onDismissTokenWarning: () => void // callback to dismiss warning
} {
  const dispatch = useDispatch()
  const dismissedTokens = useSelector(dismissedWarningTokensSelector)

  const isBasicInfo = isBasicTokenInfo(info)

  const lowercasedAddress = getValidAddress(
    isBasicInfo ? info.address : info?.isToken ? info?.address : undefined,
    false,
  )
  const tokenWarningDismissed = Boolean(
    info && lowercasedAddress && dismissedTokens && dismissedTokens[info.chainId]?.[lowercasedAddress],
  )

  const onDismissTokenWarning = useCallback(() => {
    if (isBasicInfo) {
      // handle basic info
      dispatch(dismissTokenWarning({ token: info }))
    } else {
      // handle tokens
      if (info?.isToken) {
        dispatch(dismissTokenWarning({ token: serializeToken(info) }))
      }
    }
  }, [isBasicInfo, info, dispatch])

  return { tokenWarningDismissed, onDismissTokenWarning }
}

export function useAllTagTokens(): string[] {
  return useSelector(tagTokensSelector)
}

export function useAddTagTokens(): (tokens: string[]) => void {
  const dispatch = useDispatch()

  return useCallback((tokens: string[]) => {
    dispatch(addTagTokens({ tokens }))
  }, [])
}

export function useDeleteTagTokens(): (tokens: string[]) => void {
  const dispatch = useDispatch()

  return useCallback((tokens: string[]) => {
    dispatch(deleteTagTokens({ tokens }))
  }, [])
}
