import { allTokenOfSwap } from 'poki/src/actor'
import { type TokenInfo } from 'poki/src/candid/token-list/AllTokenOfSwap'
import { useCallsData } from 'poki/src/hooks/useCallsData'
import { IcExplorerPagination, IcExplorerResult, IcExplorerTokenDetail } from 'poki/src/types/ic-explorer'
import { useCallback } from 'react'
import { resultFormat } from 'utilities/src/format/resultFormat'

export function useAllTokensOfSwap() {
  const fetch_tokens = async (offset: number, limit: number) => {
    const result = resultFormat<{
      content: Array<TokenInfo>
      offset: bigint
      limit: bigint
      totalElements: bigint
    }>(await (await allTokenOfSwap()).get_token_list(BigInt(offset), BigInt(limit), [true])).data

    return result?.content
  }

  const fetch_all_tokens = async () => {
    let allTokens: Array<TokenInfo> = []

    const fetch = async (offset: number, limit: number) => {
      const result = await fetch_tokens(offset, limit)

      if (result) {
        allTokens = allTokens.concat(result)
        if (result.length < limit) return
        await fetch(offset + limit, limit)
      }
    }

    await fetch(0, 1000)

    return allTokens
  }

  return useCallsData(
    useCallback(async () => {
      return fetch_all_tokens()
    }, []),
  )
}

export function useTokensFromExplorer() {
  const fetch_tokens: (page: number, size: number) => Promise<Array<IcExplorerTokenDetail>> = async (
    page: number,
    size: number,
  ) => {
    const fetch_result = await fetch('https://api.icexplorer.io/api/token/list', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        page,
        size,
      }),
    }).catch(() => undefined)

    if (!fetch_result) return []

    const json = (await fetch_result.json()) as IcExplorerResult<IcExplorerPagination<IcExplorerTokenDetail>>

    return json.data.list
  }

  const fetch_all_tokens = async () => {
    let allTokens: Array<IcExplorerTokenDetail> = []

    const fetch = async (page: number, size: number) => {
      const result = await fetch_tokens(page, size)
      allTokens = allTokens.concat(result)
      if (result.length < size) return
      await fetch(page + 1, size)
    }

    await fetch(1, 50)

    return allTokens
  }

  return useCallsData(
    useCallback(async () => {
      return await fetch_all_tokens()
    }, []),
  )
}
