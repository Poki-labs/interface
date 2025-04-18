import { config } from 'poki/src/config'
import { isDevEnv, isTestEnv } from 'utilities/src/environment/env'
import { isAndroid, isExtension, isInterface, isMobileApp } from 'utilities/src/platform'

enum TrafficFlows {
  GraphQL = 'graphql',
  Metrics = 'metrics',
  Gating = 'gating',
  TradingApi = 'trading-api-labs',
  Unitags = 'unitags',
  FOR = 'for',
  Scantastic = 'scantastic',
}

const FLOWS_USING_BETA = [TrafficFlows.FOR]

export const POKI_WEB_HOSTNAME = 'pokiwallet.com'

export const POKI_WEB_URL = `https://${POKI_WEB_HOSTNAME}`
export const POKI_APP_URL = 'https://pokiwallet.com/app'
export const POKI_MOBILE_REDIRECT_URL = 'https://pokiwallet.com/mobile-redirect'

const helpUrl = 'https://support.pokiwallet.com/hc/en-us'

export const pokiWalletUrls = {
  // Help and web articles/items
  helpUrl,
  helpRequestUrl: `${helpUrl}/requests/new`,
  helpArticleUrls: {
    acrossRoutingInfo: `${helpUrl}/articles/30677918339341`,
    approvalsExplainer: `${helpUrl}/articles/8120520483085-What-is-an-approval-transaction`,
    cexTransferKorea: `${helpUrl}/articles/29425131525901-How-to-transfer-crypto-to-a-Poki-Wallet-in-Korea`,
    extensionHelp: `${helpUrl}/articles/24458735271181`,
    extensionDappTroubleshooting: `${helpUrl}/articles/25811698471565-Connecting-Poki-Extension-Beta-to-other-dapps`,
    feeOnTransferHelp: `${helpUrl}/articles/18673568523789-What-is-a-token-fee-`,
    howToSwapTokens: `${helpUrl}/articles/8370549680909-How-to-swap-tokens-`,
    hiddenTokenInfo: `${helpUrl}/articles/30432674756749-How-to-hide-and-unhide-tokens-in-the-Poki-Wallet`,
    hiddenNFTInfo: `${helpUrl}/articles/14185028445837-How-to-hide-and-unhide-NFTs-in-the-Poki-Wallet`,
    impermanentLoss: `${helpUrl}/articles/20904453751693-What-is-Impermanent-Loss`,
    limitsFailure: `${helpUrl}/articles/24300813697933-Why-did-my-limit-order-fail-or-not-execute`,
    limitsInfo: `${helpUrl}/articles/24470337797005`,
    limitsNetworkSupport: `${helpUrl}/articles/24470251716237-What-networks-do-limits-support`,
    fiatOnRampHelp: `${helpUrl}/articles/11306574799117`,
    fiatOffRampHelp: `${helpUrl}/articles/34006552258957`,
    transferCryptoHelp: `${helpUrl}/articles/27103878635661-How-to-transfer-crypto-from-a-Robinhood-or-Coinbase-account-to-the-Poki-Wallet`,
    mobileWalletHelp: `${helpUrl}/articles/20317941356429`,
    moonpayRegionalAvailability: `${helpUrl}/articles/11306664890381-Why-isn-t-MoonPay-available-in-my-region-`,
    networkFeeInfo: `${helpUrl}/articles/8370337377805-What-is-a-network-fee-`,
    poolOutOfSync: `${helpUrl}/articles/25845512413069`,
    positionsLearnMore: `${helpUrl}/articles/8829880740109`,
    priceImpact: `${helpUrl}/articles/8671539602317-What-is-Price-Impact`,
    providingLiquidityInfo: `${helpUrl}/sections/20982919867021`,
    recoveryPhraseHowToImport: `${helpUrl}/articles/11380692567949-How-to-import-a-recovery-phrase-into-the-Poki-Wallet`,
    recoveryPhraseHowToFind: `${helpUrl}/articles/11306360177677-How-to-find-my-recovery-phrase-in-the-Poki-Wallet`,
    recoveryPhraseForgotten: `${helpUrl}/articles/11306367118349`,
    revokeExplainer: `${helpUrl}/articles/15724901841037-How-to-revoke-a-token-approval`,
    supportedNetworks: `${helpUrl}/articles/14569415293325`,
    swapFeeInfo: `${helpUrl}/articles/20131678274957`,
    swapProtection: `${helpUrl}/articles/18814993155853`,
    swapSlippage: `${helpUrl}/articles/8643879653261-What-is-Price-Slippage-`,
    tokenWarning: `${helpUrl}/articles/8723118437133-What-are-token-warnings-`,
    transactionFailure: `${helpUrl}/articles/8643975058829-Why-did-my-transaction-fail-`,
    pokiXInfo: `${helpUrl}/articles/17544708791821`,
    pokiXFailure: `${helpUrl}/articles/17515489874189-Why-can-my-swap-not-be-filled-`,
    unsupportedTokenPolicy: `${helpUrl}/articles/18783694078989-Unsupported-Token-Policy`,
    addingV4Hooks: `${helpUrl}/articles/32402040565133`,
    routingSettings: `${helpUrl}/articles/27362707722637`,
    v4HooksInfo: `${helpUrl}/articles/30998263256717`,
    walletSecurityMeasures: `${helpUrl}/articles/28278904584077-Poki-Wallet-Security-Measures`,
    wethExplainer: `${helpUrl}/articles/16015852009997-Why-do-ETH-swaps-involve-converting-to-WETH`,
  },
  termsOfServiceUrl: 'https://pokiwallet.com/terms-of-service',
  privacyPolicyUrl: 'https://pokiwallet.com/privacy-policy',
  chromeExtension: 'http://pokiwallet.com/ext',

  // Core API Urls
  apiOrigin: 'https://api.pokiwallet.com',
  apiBaseUrl: config.apiBaseUrlOverride || getCloudflareApiBaseUrl(),
  apiBaseUrlV2: config.apiBaseUrlV2Override || `${getCloudflareApiBaseUrl()}/v2`,
  graphQLUrl: config.graphqlUrlOverride || `${getCloudflareApiBaseUrl(TrafficFlows.GraphQL)}/v1/graphql`,

  // Proxies
  amplitudeProxyUrl:
    config.amplitudeProxyUrlOverride || `${getCloudflareApiBaseUrl(TrafficFlows.Metrics)}/v1/amplitude-proxy`,
  statsigProxyUrl: config.statsigProxyUrlOverride || `${getCloudflareApiBaseUrl(TrafficFlows.Gating)}/v1/statsig-proxy`,

  // Feature service URL's
  unitagsApiUrl: config.unitagsApiUrlOverride || `${getCloudflareApiBaseUrl(TrafficFlows.Unitags)}/v2/unitags`,
  scantasticApiUrl:
    config.scantasticApiUrlOverride || `${getCloudflareApiBaseUrl(TrafficFlows.Scantastic)}/v2/scantastic`,
  forApiUrl: config.forApiUrlOverride || `${getCloudflareApiBaseUrl(TrafficFlows.FOR)}/v2/FOR.v1.FORService`,
  tradingApiUrl: config.tradingApiUrlOverride || getCloudflareApiBaseUrl(TrafficFlows.TradingApi),

  // Embedded Wallet URL's
  // Totally fine that these are public
  evervaultDevUrl: 'https://embedded-wallet-dev.app-907329d19a06.enclave.evervault.com',
  evervaultStagingUrl: 'https://embedded-wallet-staging.app-907329d19a06.enclave.evervault.com',
  evervaultProductionUrl: 'https://embedded-wallet.app-907329d19a06.enclave.evervault.com',

  // API Paths
  trmPath: '/v1/screen',
  gasServicePath: '/v1/gas-fee',
  tradingApiPaths: {
    quote: '/v1/quote',
    indicativeQuote: '/v1/indicative_quote',
    approval: '/v1/check_approval',
    swap: '/v1/swap',
    order: '/v1/order',
    orders: '/v1/orders',
    swaps: '/v1/swaps',
    swappableTokens: '/v1/swappable_tokens',
    createLp: '/v1/lp/create',
    increaseLp: '/v1/lp/increase',
    decreaseLp: '/v1/lp/decrease',
    claimLpFees: '/v1/lp/claim',
    lpApproval: '/v1/lp/approve',
    migrate: '/v1/lp/migrate',
  },

  // App and Redirect URL's
  appBaseUrl: POKI_APP_URL,
  redirectUrlBase: POKI_MOBILE_REDIRECT_URL,
  requestOriginUrl: POKI_WEB_URL,

  // Web Interface Urls
  webInterfaceSwapUrl: `${POKI_WEB_URL}/#/swap`,
  webInterfaceTokensUrl: `${POKI_WEB_URL}/explore/tokens`,
  webInterfaceAddressUrl: `${POKI_WEB_URL}/address`,
  webInterfaceNftItemUrl: `${POKI_WEB_URL}/nfts/asset`,
  webInterfaceNftCollectionUrl: `${POKI_WEB_URL}/nfts/collection`,
  webInterfaceBuyUrl: `${POKI_WEB_URL}/buy`,

  // Feedback Links
  walletFeedbackForm:
    'https://docs.google.com/forms/d/e/1FAIpQLSepzL5aMuSfRhSgw0zDw_gVmc2aeVevfrb1UbOwn6WGJ--46w/viewform',
}

function getCloudflarePrefix(flow?: TrafficFlows): string {
  if (flow && isDevEnv() && FLOWS_USING_BETA.includes(flow)) {
    return `beta`
  }

  if (isMobileApp) {
    return `${isAndroid ? 'android' : 'ios'}.wallet`
  }

  if (isExtension) {
    return 'extension'
  }

  if (isInterface) {
    return 'interface'
  }

  if (isTestEnv()) {
    return 'wallet'
  }

  // throw new Error('Could not determine app to generate Cloudflare prefix')

  return 'extension'
}

function getServicePrefix(flow?: TrafficFlows): string {
  if (flow && !(isDevEnv() && FLOWS_USING_BETA.includes(flow))) {
    return flow + '.'
  } else {
    return ''
  }
}

function getCloudflareApiBaseUrl(flow?: TrafficFlows): string {
  return `https://${getServicePrefix(flow)}${getCloudflarePrefix(flow)}.gateway.pokiwallet.com`
}
