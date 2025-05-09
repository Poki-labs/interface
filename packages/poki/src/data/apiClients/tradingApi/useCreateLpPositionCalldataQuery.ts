import { UseQueryResult, useQuery } from '@tanstack/react-query'
import { pokiWalletUrls } from 'poki/src/constants/urls'
import { TRADING_API_CACHE_KEY, createLpPosition } from 'poki/src/data/apiClients/tradingApi/TradingApiClient'
import { getTradeSettingsDeadline } from 'poki/src/data/apiClients/tradingApi/utils/getTradeSettingsDeadline'
import { UseQueryApiHelperHookArgs } from 'poki/src/data/apiClients/types'
import { CreateLPPositionRequest, CreateLPPositionResponse } from 'poki/src/data/tradingApi/__generated__'

export function useCreateLpPositionCalldataQuery({
  params,
  deadlineInMinutes,
  ...rest
}: UseQueryApiHelperHookArgs<CreateLPPositionRequest, CreateLPPositionResponse> & {
  deadlineInMinutes?: number
}): UseQueryResult<CreateLPPositionResponse> {
  const queryKey = [TRADING_API_CACHE_KEY, pokiWalletUrls.tradingApiPaths.createLp, params]
  const deadline = getTradeSettingsDeadline(deadlineInMinutes)
  const paramsWithDeadline = { ...params, deadline }

  return useQuery<CreateLPPositionResponse>({
    queryKey,
    queryFn: async () => {
      if (!params) {
        throw { name: 'Params are required' }
      }
      return await createLpPosition(paramsWithDeadline)
    },
    ...rest,
  })
}
