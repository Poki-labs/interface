import { UseQueryResult, skipToken } from '@tanstack/react-query'
import { pokiWalletUrls } from 'poki/src/constants/urls'
import { useQueryWithImmediateGarbageCollection } from 'poki/src/data/apiClients/hooks/useQueryWithImmediateGarbageCollection'
import { TRADING_API_CACHE_KEY, fetchCheckApproval } from 'poki/src/data/apiClients/tradingApi/TradingApiClient'
import { UseQueryWithImmediateGarbageCollectionApiHelperHookArgs } from 'poki/src/data/apiClients/types'
import { ApprovalRequest, ApprovalResponse } from 'poki/src/data/tradingApi/__generated__'

export function useCheckApprovalQuery({
  params,
  ...rest
}: UseQueryWithImmediateGarbageCollectionApiHelperHookArgs<
  ApprovalRequest,
  ApprovalResponse
>): UseQueryResult<ApprovalResponse> {
  const queryKey = [TRADING_API_CACHE_KEY, pokiWalletUrls.tradingApiPaths.approval, params]

  return useQueryWithImmediateGarbageCollection<ApprovalResponse>({
    queryKey,
    queryFn: params ? async (): ReturnType<typeof fetchCheckApproval> => await fetchCheckApproval(params) : skipToken,
    ...rest,
  })
}
