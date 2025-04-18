import { UseQueryResult, useQuery } from '@tanstack/react-query'
import { pokiWalletUrls } from 'poki/src/constants/urls'
import { TRADING_API_CACHE_KEY, migrateLpPosition } from 'poki/src/data/apiClients/tradingApi/TradingApiClient'
import { UseQueryApiHelperHookArgs } from 'poki/src/data/apiClients/types'
import { MigrateLPPositionRequest, MigrateLPPositionResponse } from 'poki/src/data/tradingApi/__generated__'

export function useMigrateV3LpPositionCalldataQuery({
  params,
  ...rest
}: UseQueryApiHelperHookArgs<
  MigrateLPPositionRequest,
  MigrateLPPositionResponse
>): UseQueryResult<MigrateLPPositionResponse> {
  const queryKey = [TRADING_API_CACHE_KEY, pokiWalletUrls.tradingApiPaths.migrate, params]

  return useQuery<MigrateLPPositionResponse>({
    queryKey,
    queryFn: async () => {
      if (!params) {
        throw { name: 'Params are required' }
      }
      return await migrateLpPosition(params)
    },
    ...rest,
  })
}
