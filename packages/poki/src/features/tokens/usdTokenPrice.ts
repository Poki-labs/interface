import { useInfoToken } from 'poki/src/features/tokens/useInfoToken'
import { useMemo } from 'react'

export function useTokenPrice(_currencyId: string | null | undefined) {
  const infoToken = useInfoToken(_currencyId)

  return useMemo(() => {
    if (!infoToken) {
      return undefined
    }

    return infoToken.priceUSD
  }, [infoToken])
}
