import { UseQueryResult, skipToken, useQuery } from '@tanstack/react-query'
import { pokiWalletUrls } from 'poki/src/constants/urls'
import {
  POKI_API_CACHE_KEY,
  ScreenRequest,
  ScreenResponse,
  fetchTrmScreen,
} from 'poki/src/data/apiClients/pokiApi/pokiApiClient'
import { UseQueryApiHelperHookArgs } from 'poki/src/data/apiClients/types'

export function useTrmScreenQuery({
  params,
  ...rest
}: UseQueryApiHelperHookArgs<ScreenRequest, ScreenResponse>): UseQueryResult<ScreenResponse> {
  const queryKey = [POKI_API_CACHE_KEY, pokiWalletUrls.trmPath, params]

  return useQuery<ScreenResponse>({
    queryKey,
    queryFn: params ? async (): ReturnType<typeof fetchTrmScreen> => await fetchTrmScreen(params) : skipToken,
    ...rest,
  })
}
