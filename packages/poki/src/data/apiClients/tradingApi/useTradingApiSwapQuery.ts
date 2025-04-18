import { UseQueryResult, skipToken } from '@tanstack/react-query'
import { pokiWalletUrls } from 'poki/src/constants/urls'
import { useQueryWithImmediateGarbageCollection } from 'poki/src/data/apiClients/hooks/useQueryWithImmediateGarbageCollection'
import { TRADING_API_CACHE_KEY, WithV4Flag, fetchSwap } from 'poki/src/data/apiClients/tradingApi/TradingApiClient'
import { UseQueryWithImmediateGarbageCollectionApiHelperHookArgs } from 'poki/src/data/apiClients/types'
import { CreateSwapRequest, CreateSwapResponse } from 'poki/src/data/tradingApi/__generated__'

export function useTradingApiSwapQuery({
  params,
  ...rest
}: UseQueryWithImmediateGarbageCollectionApiHelperHookArgs<
  WithV4Flag<CreateSwapRequest>,
  CreateSwapResponse
>): UseQueryResult<CreateSwapResponse> {
  const queryKey = [TRADING_API_CACHE_KEY, pokiWalletUrls.tradingApiPaths.swap, params]

  return useQueryWithImmediateGarbageCollection<CreateSwapResponse>({
    queryKey,
    queryFn: params ? async (): ReturnType<typeof fetchSwap> => await fetchSwap(params) : skipToken,
    ...rest,
  })
}
