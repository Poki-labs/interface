import { useCallsData } from 'poki/src/hooks/useCallsData'
import { IcExplorerAddressTransaction, IcExplorerPagination, IcExplorerResult } from 'poki/src/types/ic-explorer'
import { useCallback } from 'react'

export interface GetAddressTransactions {
  principal: string
  page: number
  size: number
  beginTime: string
  endTime: string
  txTypes: string[]
}

export async function getAddressTransactions({
  principal,
  page,
  size,
  beginTime,
  endTime,
  txTypes,
}: GetAddressTransactions) {
  const fetch_result = await fetch('https://api.icexplorer.io/api/tx/list', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      principal,
      page,
      size,
      beginTime,
      endTime,
      txTypes,
    }),
  }).catch(() => undefined)

  if (!fetch_result) return undefined

  return ((await fetch_result.json()) as IcExplorerResult<IcExplorerPagination<IcExplorerAddressTransaction>>).data
    ?.list
}

export interface UseAddressTransactions {
  principal: string | null | undefined
  page: number
  size: number
  beginTime: string
  endTime: string
  txTypes?: string[]
}

export function useAddressTransactions({ principal, page, size, beginTime, endTime, txTypes }: UseAddressTransactions) {
  return useCallsData(
    useCallback(async () => {
      if (!principal) return undefined
      return await getAddressTransactions({ principal, page, size, beginTime, endTime, txTypes: txTypes ?? [] })
    }, [principal, page, size, beginTime, endTime, txTypes]),
  )
}

export interface UseAddress1000TransactionsProps {
  principal: string | undefined | null
}

export function useAddress1000Transactions({ principal }: UseAddress1000TransactionsProps) {
  return useCallsData(
    useCallback(async () => {
      if (!principal) return undefined

      const endTime = new Date().getTime()
      // 180 days
      const beginTime = new Date().getTime() - 180 * 24 * 3600 * 100

      return await getAddressTransactions({
        principal,
        page: 1,
        size: 1000,
        beginTime: String(beginTime),
        endTime: String(endTime),
        txTypes: [],
      })
    }, [principal]),
  )
}
