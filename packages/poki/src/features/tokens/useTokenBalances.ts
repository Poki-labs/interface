import { useCallsData } from 'poki/src/hooks/useCallsData'
import { useCallback } from 'react'

export type UseTokenBalancesProps = {
  principal: string | undefined | null
  tokenIds: string[]
}

export function useTokenBalances({ principal, tokenIds }: UseTokenBalancesProps) {
  return useCallsData(
    useCallback(async () => {
      if (!principal || tokenIds.length === 0) return undefined

      const fetch_result = await fetch('https://api.icexplorer.io/api/token/balance', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          principal,
          ledgers: tokenIds,
        }),
      }).catch(() => undefined)

      if (!fetch_result) return undefined

      return (await fetch_result.json()) as {
        statusCode: number
        data: {
          principal: string
          balances: Array<{ ledger: string; amount: number }>
        }
      }
    }, [principal, tokenIds]),
  )
}
