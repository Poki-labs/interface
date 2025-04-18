import { UseQueryResult, useQuery } from '@tanstack/react-query'
import { pokiWalletUrls } from 'poki/src/constants/urls'
import { TRADING_API_CACHE_KEY, checkLpApproval } from 'poki/src/data/apiClients/tradingApi/TradingApiClient'
import { UseQueryApiHelperHookArgs } from 'poki/src/data/apiClients/types'
import { CheckApprovalLPRequest, CheckApprovalLPResponse } from 'poki/src/data/tradingApi/__generated__'

export function useCheckLpApprovalQuery({
  params,
  headers,
  ...rest
}: UseQueryApiHelperHookArgs<CheckApprovalLPRequest, CheckApprovalLPResponse> & {
  headers?: Record<string, string>
}): UseQueryResult<CheckApprovalLPResponse> {
  const queryKey = [TRADING_API_CACHE_KEY, pokiWalletUrls.tradingApiPaths.lpApproval, params]

  return useQuery<CheckApprovalLPResponse>({
    queryKey,
    queryFn: async () => {
      if (!params) {
        throw { name: 'Params are required' }
      }
      return await checkLpApproval(params, headers)
    },
    ...rest,
  })
}
