import axios from 'axios'
import { pokiWalletUrls } from 'poki/src/constants/urls'
import { REQUEST_SOURCE, getVersionHeader } from 'poki/src/data/constants'
import {
  ProfileMetadata,
  UnitagAddressResponse,
  UnitagAddressesResponse,
  UnitagChangeUsernameRequestBody,
  UnitagClaimUsernameRequestBody,
  UnitagDeleteUsernameRequestBody,
  UnitagGetAvatarUploadUrlResponse,
  UnitagResponse,
  UnitagUpdateMetadataRequestBody,
  UnitagUpdateMetadataResponse,
} from 'poki/src/features/unitags/types'
import { isMobileApp } from 'utilities/src/platform'
import { createSignedRequestBody, createSignedRequestParams } from 'wallet/src/data/utils'
import { Account } from 'wallet/src/features/wallet/accounts/types'
import { SignerManager } from 'wallet/src/features/wallet/signing/SignerManager'

const BASE_HEADERS = {
  'x-request-source': REQUEST_SOURCE,
  'x-app-version': getVersionHeader(),
  ...(isMobileApp ? { Origin: pokiWalletUrls.apiOrigin } : {}),
}

const generateAxiosHeaders = async (signature: string): Promise<Record<string, string>> => {
  return {
    ...BASE_HEADERS,
    'x-poki-sig': signature,
  }
}

// Axios requests with signature authentication

export async function getUnitagAvatarUploadUrl({
  username,
  account,
  signerManager,
}: {
  username: string
  account: Account
  signerManager: SignerManager
}): ReturnType<typeof axios.get<UnitagGetAvatarUploadUrlResponse>> {
  const avatarUploadUrl = `${pokiWalletUrls.unitagsApiUrl}/username/avatar-upload-url`
  const { requestParams, signature } = await createSignedRequestParams<{
    username: string
  }>({ username }, account, signerManager)
  const headers = await generateAxiosHeaders(signature)
  return await axios.get<UnitagGetAvatarUploadUrlResponse>(avatarUploadUrl, {
    params: requestParams,
    headers,
  })
}

export async function deleteUnitag({
  username,
  account,
  signerManager,
}: {
  username: string
  account: Account
  signerManager: SignerManager
}): ReturnType<typeof axios.delete<UnitagResponse>> {
  const avatarUploadUrl = `${pokiWalletUrls.unitagsApiUrl}/username`
  const { requestBody, signature } = await createSignedRequestBody<UnitagDeleteUsernameRequestBody>(
    { username },
    account,
    signerManager,
  )
  const headers = await generateAxiosHeaders(signature)
  return await axios.delete<UnitagResponse>(avatarUploadUrl, {
    data: requestBody,
    headers,
  })
}

export async function updateUnitagMetadata({
  username,
  metadata,
  clearAvatar,
  account,
  signerManager,
}: {
  username: string
  metadata: ProfileMetadata
  clearAvatar: boolean
  account: Account
  signerManager: SignerManager
}): ReturnType<typeof axios.put<UnitagUpdateMetadataResponse>> {
  const updateMetadataUrl = `${pokiWalletUrls.unitagsApiUrl}/username/${username}/metadata`
  const { requestBody, signature } = await createSignedRequestBody<UnitagUpdateMetadataRequestBody>(
    {
      metadata,
      clearAvatar,
    },
    account,
    signerManager,
  )
  const headers = await generateAxiosHeaders(signature)
  return await axios.put<UnitagUpdateMetadataResponse>(updateMetadataUrl, requestBody, {
    headers,
  })
}

export async function claimUnitag({
  username,
  deviceId,
  metadata,
  account,
  signerManager,
}: {
  username: string
  deviceId: string
  metadata: ProfileMetadata
  account: Account
  signerManager: SignerManager
}): ReturnType<typeof axios.post<UnitagResponse>> {
  const claimUnitagUrl = `${pokiWalletUrls.unitagsApiUrl}/username`
  const { requestBody, signature } = await createSignedRequestBody<UnitagClaimUsernameRequestBody>(
    {
      username,
      deviceId,
      metadata,
    },
    account,
    signerManager,
  )
  const headers = await generateAxiosHeaders(signature)
  return await axios.post<UnitagResponse>(claimUnitagUrl, requestBody, {
    headers,
  })
}

export async function changeUnitag({
  username,
  deviceId,
  account,
  signerManager,
}: {
  username: string
  deviceId: string
  account: Account
  signerManager: SignerManager
}): ReturnType<typeof axios.post<UnitagResponse>> {
  const changeUnitagUrl = `${pokiWalletUrls.unitagsApiUrl}/username/change`
  const { requestBody, signature } = await createSignedRequestBody<UnitagChangeUsernameRequestBody>(
    {
      username,
      deviceId,
    },
    account,
    signerManager,
  )
  const headers = await generateAxiosHeaders(signature)
  return await axios.post<UnitagResponse>(changeUnitagUrl, requestBody, {
    headers,
  })
}

/**
 * TODO WALL-5159 Remove this function and replace with UnitagsApiClient.ts/fetchAddresses
 *
 * @deprecated
 * @param addresses
 * @returns
 */
export async function fetchUnitagByAddresses(addresses: Address[]): Promise<{
  data?: {
    [address: Address]: UnitagAddressResponse
  }
  error?: unknown
}> {
  const unitagAddressesUrl = `${pokiWalletUrls.unitagsApiUrl}/addresses?addresses=${encodeURIComponent(
    addresses.join(','),
  )}`

  try {
    const response = await axios.get<UnitagAddressesResponse>(unitagAddressesUrl, {
      headers: BASE_HEADERS,
    })
    return {
      data: response.data.usernames,
    }
  } catch (error) {
    return { error }
  }
}
