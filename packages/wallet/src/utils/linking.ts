import * as WebBrowser from 'expo-web-browser'
import { pokiWalletUrls } from 'poki/src/constants/urls'
import { getChainInfo } from 'poki/src/features/chains/chainInfo'
import { UniverseChainId } from 'poki/src/features/chains/types'
import { toPokiWebAppLink } from 'poki/src/features/chains/utils'
import { BACKEND_NATIVE_CHAIN_ADDRESS_STRING } from 'poki/src/features/search/utils'
import { ServiceProviderInfo } from 'poki/src/features/transactions/types/transactionDetails'
import { currencyIdToChain, currencyIdToGraphQLAddress } from 'poki/src/utils/currencyId'
import { ExplorerDataType, getExplorerLink, openUri } from 'poki/src/utils/linking'
import { Linking } from 'react-native'

export function dismissInAppBrowser(): void {
  WebBrowser.dismissBrowser()
}

export async function openTransactionLink(hash: string | undefined, chainId: UniverseChainId): Promise<void> {
  if (!hash) {
    return undefined
  }
  const explorerUrl = getExplorerLink(chainId, hash, ExplorerDataType.TRANSACTION)
  return openUri(explorerUrl)
}

export async function openPokiHelpLink(): Promise<void> {
  return openUri(pokiWalletUrls.helpRequestUrl)
}

export async function openFORSupportLink(serviceProvider: ServiceProviderInfo): Promise<void> {
  return openUri(serviceProvider.supportUrl ?? pokiWalletUrls.helpRequestUrl)
}

export async function openOfframpPendingSupportLink(): Promise<void> {
  return openUri(pokiWalletUrls.helpArticleUrls.fiatOffRampHelp)
}

export async function openSettings(): Promise<void> {
  await Linking.openSettings()
}

/**
 * Return the explorer name for the given chain ID
 * @param chainId the ID of the chain for which to return the explorer name
 */
export function getExplorerName(chainId: UniverseChainId): string {
  return getChainInfo(chainId).explorer.name
}

export function getNftCollectionUrl(contractAddress: Maybe<string>): string | undefined {
  if (!contractAddress) {
    return undefined
  }
  return `${pokiWalletUrls.webInterfaceNftCollectionUrl}/${contractAddress}`
}

export function getNftUrl(contractAddress: string, tokenId: string): string {
  return `${pokiWalletUrls.webInterfaceNftItemUrl}/${contractAddress}/${tokenId}`
}

export function getProfileUrl(walletAddress: string): string {
  return `${pokiWalletUrls.webInterfaceAddressUrl}/${walletAddress}`
}

const UTM_TAGS_MOBILE = 'utm_medium=mobile&utm_source=share-tdp'

export function getTokenUrl(currencyId: string, addMobileUTMTags: boolean = false): string | undefined {
  const chainId = currencyIdToChain(currencyId) as UniverseChainId
  if (!chainId) {
    return undefined
  }
  const network = toPokiWebAppLink(chainId)
  try {
    let tokenAddress = currencyIdToGraphQLAddress(currencyId)
    // in case it's a native token
    if (tokenAddress === null) {
      // this is how web app handles native tokens
      tokenAddress = BACKEND_NATIVE_CHAIN_ADDRESS_STRING
    }
    const tokenUrl = `${pokiWalletUrls.webInterfaceTokensUrl}/${network}/${tokenAddress}`
    return addMobileUTMTags ? tokenUrl + `?${UTM_TAGS_MOBILE}` : tokenUrl
  } catch (_) {
    return undefined
  }
}

export function getTwitterLink(twitterName: string): string {
  return `https://twitter.com/${twitterName}`
}
