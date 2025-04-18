import { Principal } from '@dfinity/principal'
import { icrc1 } from 'poki/src/actor'
import { useCallsData } from 'poki/src/hooks/useCallsData'
import { useCallback } from 'react'

export type UseTokenBalanceProps = {
  principal: string | undefined | null
  tokenId: string | undefined | null
}

export function useTokenBalance({ principal, tokenId }: UseTokenBalanceProps) {
  return useCallsData(
    useCallback(async () => {
      if (!principal || !tokenId) return undefined

      const result = await (
        await icrc1(tokenId)
      ).icrc1_balance_of({ owner: Principal.fromText(principal), subaccount: [] })

      return result.toString()
    }, [principal, tokenId]),
  )
}
