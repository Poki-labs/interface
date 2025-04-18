import { UseQueryResult, skipToken } from '@tanstack/react-query'
import { pokiWalletUrls } from 'poki/src/constants/urls'
import { useQueryWithImmediateGarbageCollection } from 'poki/src/data/apiClients/hooks/useQueryWithImmediateGarbageCollection'
import {
  DiscriminatedQuoteResponse,
  TRADING_API_CACHE_KEY,
  WithV4Flag,
  fetchQuote,
} from 'poki/src/data/apiClients/tradingApi/TradingApiClient'
import { UseQueryWithImmediateGarbageCollectionApiHelperHookArgs } from 'poki/src/data/apiClients/types'
import { QuoteRequest } from 'poki/src/data/tradingApi/__generated__'
import { logSwapQuoteFetch } from 'poki/src/features/transactions/swap/analytics'

export function useTradingApiQuoteQuery({
  params,
  ...rest
}: UseQueryWithImmediateGarbageCollectionApiHelperHookArgs<
  WithV4Flag<QuoteRequest & { isUSDQuote?: boolean }>,
  DiscriminatedQuoteResponse
>): UseQueryResult<DiscriminatedQuoteResponse> {
  const queryKey = [TRADING_API_CACHE_KEY, pokiWalletUrls.tradingApiPaths.quote, params]

  return useQueryWithImmediateGarbageCollection<DiscriminatedQuoteResponse>({
    queryKey,
    queryFn: params
      ? async (): ReturnType<typeof fetchQuote> => {
          const { isUSDQuote, ...fetchParams } = params
          if (fetchParams.tokenInChainId) {
            logSwapQuoteFetch({ chainId: fetchParams.tokenInChainId, isUSDQuote })
          }
          return await fetchQuote(fetchParams)
        }
      : skipToken,
    ...rest,
  })
}
