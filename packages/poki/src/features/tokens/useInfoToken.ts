import { useGlobalContext } from 'poki/src/components/GlobalProvider'
import { useMemo } from 'react'

export function useInfoToken(_currencyId: string | null | undefined) {
  const { allTokensInfo } = useGlobalContext()

  return useMemo(() => {
    if (!_currencyId) {
      return undefined
    }

    return allTokensInfo.find((e) => e.address === _currencyId)
  }, [_currencyId, allTokensInfo])
}
