import { config } from 'poki/src/config'
import { pokiWalletUrls } from 'poki/src/constants/urls'
import { createApiClient } from 'poki/src/data/apiClients/createApiClient'
import { SwappableTokensParams } from 'poki/src/data/apiClients/tradingApi/useTradingApiSwappableTokensQuery'
import {
  ApprovalRequest,
  ApprovalResponse,
  BridgeQuote,
  ChainId,
  CheckApprovalLPRequest,
  CheckApprovalLPResponse,
  ClaimLPFeesRequest,
  ClaimLPFeesResponse,
  ClassicQuote,
  CreateLPPositionRequest,
  CreateLPPositionResponse,
  CreateSwapRequest,
  CreateSwapResponse,
  DecreaseLPPositionRequest,
  DecreaseLPPositionResponse,
  DutchQuoteV2,
  DutchQuoteV3,
  GetOrdersResponse,
  GetSwappableTokensResponse,
  GetSwapsResponse,
  IncreaseLPPositionRequest,
  IncreaseLPPositionResponse,
  IndicativeQuoteRequest,
  IndicativeQuoteResponse,
  MigrateLPPositionRequest,
  MigrateLPPositionResponse,
  OrderRequest,
  OrderResponse,
  PriorityQuote,
  QuoteRequest,
  QuoteResponse,
  Routing,
  TransactionHash,
  UniversalRouterVersion,
} from 'poki/src/data/tradingApi/__generated__'
import { UniverseChainId } from 'poki/src/features/chains/types'
import { isTestEnv } from 'utilities/src/environment/env'

// TradingAPI team is looking into updating type generation to produce the following types for it's current QuoteResponse type:
// See: https://linear.app/poki/issue/API-236/explore-changing-the-quote-schema-to-pull-out-a-basequoteresponse
export type DiscriminatedQuoteResponse =
  | ClassicQuoteResponse
  | DutchQuoteResponse
  | DutchV3QuoteResponse
  | PriorityQuoteResponse
  | BridgeQuoteResponse

export type DutchV3QuoteResponse = QuoteResponse & {
  quote: DutchQuoteV3
  routing: Routing.DUTCH_V3
}

export type DutchQuoteResponse = QuoteResponse & {
  quote: DutchQuoteV2
  routing: Routing.DUTCH_V2
}

export type PriorityQuoteResponse = QuoteResponse & {
  quote: PriorityQuote
  routing: Routing.PRIORITY
}

export type ClassicQuoteResponse = QuoteResponse & {
  quote: ClassicQuote
  routing: Routing.CLASSIC
}

export type BridgeQuoteResponse = QuoteResponse & {
  quote: BridgeQuote
  routing: Routing.BRIDGE
}

export const TRADING_API_CACHE_KEY = 'TradingApi'

const TradingApiClient = createApiClient({
  baseUrl: pokiWalletUrls.tradingApiUrl,
  additionalHeaders: {
    'x-api-key': config.tradingApiKey,
  },
})

export type WithV4Flag<T> = T & { v4Enabled: boolean }

export async function fetchQuote({
  v4Enabled,
  ...params
}: WithV4Flag<QuoteRequest>): Promise<DiscriminatedQuoteResponse> {
  return await TradingApiClient.post<DiscriminatedQuoteResponse>(pokiWalletUrls.tradingApiPaths.quote, {
    body: JSON.stringify(params),
    headers: {
      'x-universal-router-version': v4Enabled ? UniversalRouterVersion._2_0 : UniversalRouterVersion._1_2,
    },
  })
}

export async function fetchIndicativeQuote(params: IndicativeQuoteRequest): Promise<IndicativeQuoteResponse> {
  return await TradingApiClient.post<IndicativeQuoteResponse>(pokiWalletUrls.tradingApiPaths.indicativeQuote, {
    body: JSON.stringify(params),
  })
}

export async function fetchSwap({ v4Enabled, ...params }: WithV4Flag<CreateSwapRequest>): Promise<CreateSwapResponse> {
  return await TradingApiClient.post<CreateSwapResponse>(pokiWalletUrls.tradingApiPaths.swap, {
    body: JSON.stringify(params),
    headers: {
      'x-universal-router-version': v4Enabled ? '2.0' : '1.2',
    },
  })
}

export async function fetchCheckApproval(params: ApprovalRequest): Promise<ApprovalResponse> {
  return await TradingApiClient.post<ApprovalResponse>(pokiWalletUrls.tradingApiPaths.approval, {
    body: JSON.stringify(params),
  })
}

export async function submitOrder(params: OrderRequest): Promise<OrderResponse> {
  return await TradingApiClient.post<OrderResponse>(pokiWalletUrls.tradingApiPaths.order, {
    body: JSON.stringify(params),
  })
}

export async function fetchOrders({ orderIds }: { orderIds: string[] }): Promise<GetOrdersResponse> {
  return await TradingApiClient.get<GetOrdersResponse>(pokiWalletUrls.tradingApiPaths.orders, {
    params: {
      orderIds: orderIds.join(','),
    },
  })
}

export async function fetchSwappableTokens(params: SwappableTokensParams): Promise<GetSwappableTokensResponse> {
  const chainBlocklist = params.unichainEnabled ? [] : [UniverseChainId.Unichain.toString()]

  return await TradingApiClient.get<GetSwappableTokensResponse>(pokiWalletUrls.tradingApiPaths.swappableTokens, {
    params: {
      tokenIn: params.tokenIn,
      tokenInChainId: params.tokenInChainId,
    },
    headers:
      params.unichainEnabled || isTestEnv()
        ? {}
        : {
            'x-chain-blocklist': chainBlocklist.join(','),
          },
  })
}

export async function createLpPosition(params: CreateLPPositionRequest): Promise<CreateLPPositionResponse> {
  return await TradingApiClient.post<CreateLPPositionResponse>(pokiWalletUrls.tradingApiPaths.createLp, {
    body: JSON.stringify({
      ...params,
    }),
  })
}
export async function decreaseLpPosition(params: DecreaseLPPositionRequest): Promise<DecreaseLPPositionResponse> {
  return await TradingApiClient.post<DecreaseLPPositionResponse>(pokiWalletUrls.tradingApiPaths.decreaseLp, {
    body: JSON.stringify({
      ...params,
    }),
  })
}
export async function increaseLpPosition(params: IncreaseLPPositionRequest): Promise<IncreaseLPPositionResponse> {
  return await TradingApiClient.post<IncreaseLPPositionResponse>(pokiWalletUrls.tradingApiPaths.increaseLp, {
    body: JSON.stringify({
      ...params,
    }),
  })
}
export async function checkLpApproval(
  params: CheckApprovalLPRequest,
  headers?: Record<string, string>,
): Promise<CheckApprovalLPResponse> {
  return await TradingApiClient.post<CheckApprovalLPResponse>(pokiWalletUrls.tradingApiPaths.lpApproval, {
    body: JSON.stringify({
      ...params,
    }),
    headers,
  })
}

export async function claimLpFees(params: ClaimLPFeesRequest): Promise<ClaimLPFeesResponse> {
  return await TradingApiClient.post<ClaimLPFeesResponse>(pokiWalletUrls.tradingApiPaths.claimLpFees, {
    body: JSON.stringify({
      ...params,
    }),
  })
}

export async function fetchSwaps(params: { txHashes: TransactionHash[]; chainId: ChainId }): Promise<GetSwapsResponse> {
  return await TradingApiClient.get<GetSwapsResponse>(pokiWalletUrls.tradingApiPaths.swaps, {
    params: {
      txHashes: params.txHashes.join(','),
      chainId: params.chainId,
    },
  })
}

export async function migrateLpPosition(params: MigrateLPPositionRequest): Promise<MigrateLPPositionResponse> {
  return await TradingApiClient.post<MigrateLPPositionResponse>(pokiWalletUrls.tradingApiPaths.migrate, {
    body: JSON.stringify({
      ...params,
    }),
  })
}
