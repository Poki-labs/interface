import { UseQueryResult, useQuery } from '@tanstack/react-query'
import { pokiWalletUrls } from 'poki/src/constants/urls'
import { TRADING_API_CACHE_KEY, decreaseLpPosition } from 'poki/src/data/apiClients/tradingApi/TradingApiClient'
import { getTradeSettingsDeadline } from 'poki/src/data/apiClients/tradingApi/utils/getTradeSettingsDeadline'
import { UseQueryApiHelperHookArgs } from 'poki/src/data/apiClients/types'
import { DecreaseLPPositionRequest, DecreaseLPPositionResponse } from 'poki/src/data/tradingApi/__generated__'

export function useDecreaseLpPositionCalldataQuery({
  params,
  deadlineInMinutes,
  ...rest
}: UseQueryApiHelperHookArgs<DecreaseLPPositionRequest, DecreaseLPPositionResponse> & {
  deadlineInMinutes: number | undefined
}): UseQueryResult<DecreaseLPPositionResponse> {
  const queryKey = [TRADING_API_CACHE_KEY, pokiWalletUrls.tradingApiPaths.decreaseLp, params]

  const deadline = getTradeSettingsDeadline(deadlineInMinutes)
  const paramsWithDeadline = { ...params, deadline }

  return useQuery<DecreaseLPPositionResponse>({
    queryKey,
    queryFn: async () => {
      if (!params) {
        throw { name: 'Params are required' }
      }
      return await decreaseLpPosition(paramsWithDeadline)
    },
    ...rest,
  })
}
