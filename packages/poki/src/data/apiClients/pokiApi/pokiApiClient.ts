import { TransactionRequest } from '@ethersproject/providers'
import { config } from 'poki/src/config'
import { pokiWalletUrls } from 'poki/src/constants/urls'
import { createApiClient } from 'poki/src/data/apiClients/createApiClient'
import { GasFeeResponse } from 'poki/src/features/gas/types'
import { isInterface } from 'utilities/src/platform'

export const POKI_API_CACHE_KEY = 'PokiApi'

const pokiApiClient = createApiClient({
  baseUrl: pokiWalletUrls.apiBaseUrl,
  additionalHeaders: {
    'x-api-key': config.pokiApiKey,
  },
  includeBasePokiHeaders: !isInterface,
})

export async function fetchGasFee(params: TransactionRequest): Promise<GasFeeResponse> {
  return await pokiApiClient.post<GasFeeResponse>(pokiWalletUrls.gasServicePath, {
    body: JSON.stringify(params),
  })
}

export type ScreenResponse = {
  block: boolean
}

export type ScreenRequest = {
  address: string
}

export async function fetchTrmScreen(params: ScreenRequest): Promise<ScreenResponse> {
  return await pokiApiClient.post<ScreenResponse>(pokiWalletUrls.trmPath, {
    body: JSON.stringify(params),
  })
}
