import { pokiWalletUrls } from 'poki/src/constants/urls'
import { createApiClient } from 'poki/src/data/apiClients/createApiClient'
import {
  UnitagAddressRequest,
  UnitagAddressResponse,
  UnitagAddressesRequest,
  UnitagAddressesResponse,
  UnitagClaimEligibilityRequest,
  UnitagClaimEligibilityResponse,
  UnitagUsernameRequest,
  UnitagUsernameResponse,
} from 'poki/src/features/unitags/types'

export const UNITAGS_API_CACHE_KEY = 'UnitagsApi'

const UnitagsApiClient = createApiClient({
  baseUrl: pokiWalletUrls.unitagsApiUrl,
})

export async function fetchUsername(params: UnitagUsernameRequest): Promise<UnitagUsernameResponse> {
  return await UnitagsApiClient.get<UnitagUsernameResponse>('/username', { params })
}

export async function fetchAddress(params: UnitagAddressRequest): Promise<UnitagAddressResponse> {
  return await UnitagsApiClient.get<UnitagAddressResponse>('/address', { params })
}

export async function fetchAddresses({ addresses }: UnitagAddressesRequest): Promise<UnitagAddressesResponse> {
  return await UnitagsApiClient.get<UnitagAddressesResponse>(
    `/addresses?addresses=${encodeURIComponent(addresses.join(','))}`,
  )
}

export async function fetchClaimEligibility(
  params: UnitagClaimEligibilityRequest,
): Promise<UnitagClaimEligibilityResponse> {
  return await UnitagsApiClient.get<UnitagClaimEligibilityResponse>('/claim/eligibility', { params })
}
