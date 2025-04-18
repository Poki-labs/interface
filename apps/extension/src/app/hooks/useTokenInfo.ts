import { useMemo } from 'react'
import { useGlobalContext } from 'poki/src/components/GlobalProvider'
import { IcExplorerTokenDetail } from 'poki/src/types/ic-explorer'

export function useTokenInfo(tokenId: string | undefined | null): IcExplorerTokenDetail | null | undefined {
  const globalContext = useGlobalContext()

  return useMemo(() => {
    if (!tokenId) return null

    return globalContext.tokens.find((e) => e.ledgerId.toString() === tokenId)
  }, [globalContext, tokenId])
}
