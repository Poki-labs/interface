import { node_index } from 'poki/src/actor'
import { PublicTokenOverview } from 'poki/src/candid/info/node_index'
import { useCallsData } from 'poki/src/hooks/useCallsData'
import { useCallback } from 'react'
import { resultFormat } from 'utilities/src/format/resultFormat'

export async function getAllTokensInfo() {
  return resultFormat<PublicTokenOverview[]>(await (await node_index()).getAllTokens()).data
}

export function useAllTokensInfo() {
  return useCallsData(
    useCallback(async () => {
      return await getAllTokensInfo()
    }, []),
  )
}
