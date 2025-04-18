import { TransactionRequest } from '@ethersproject/providers'
import { UseQueryResult, skipToken } from '@tanstack/react-query'
import { pokiWalletUrls } from 'poki/src/constants/urls'
import { useQueryWithImmediateGarbageCollection } from 'poki/src/data/apiClients/hooks/useQueryWithImmediateGarbageCollection'
import { POKI_API_CACHE_KEY, fetchGasFee } from 'poki/src/data/apiClients/pokiApi/pokiApiClient'
import { UseQueryWithImmediateGarbageCollectionApiHelperHookArgs } from 'poki/src/data/apiClients/types'
import { GasStrategy } from 'poki/src/data/tradingApi/types'
import { GasFeeResponse } from 'poki/src/features/gas/types'

export function useGasFeeQuery({
  params,
  ...rest
}: UseQueryWithImmediateGarbageCollectionApiHelperHookArgs<
  TransactionRequest & { gasStrategies: GasStrategy[] },
  GasFeeResponse
>): UseQueryResult<GasFeeResponse> {
  const queryKey = [POKI_API_CACHE_KEY, pokiWalletUrls.gasServicePath, params]

  return useQueryWithImmediateGarbageCollection<GasFeeResponse>({
    queryKey,
    queryFn: params ? async (): ReturnType<typeof fetchGasFee> => await fetchGasFee(params) : skipToken,
    ...rest,
  })
}
