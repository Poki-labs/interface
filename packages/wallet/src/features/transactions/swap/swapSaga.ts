import { Routing } from 'poki/src/data/tradingApi/__generated__/index'
import { SignerMnemonicAccountMeta } from 'poki/src/features/accounts/types'
import { FeatureFlags, getFeatureFlagName } from 'poki/src/features/gating/flags'
import { Statsig } from 'poki/src/features/gating/sdk/statsig'
import { pushNotification } from 'poki/src/features/notifications/slice'
import { AppNotificationType } from 'poki/src/features/notifications/types'
import { getBaseTradeAnalyticsProperties } from 'poki/src/features/transactions/swap/analytics'
import { ValidatedSwapTxContext } from 'poki/src/features/transactions/swap/types/swapTxAndGasInfo'
import { isPokiX } from 'poki/src/features/transactions/swap/utils/routing'
import { tradeToTransactionInfo } from 'poki/src/features/transactions/swap/utils/trade'
import {
  ApproveTransactionInfo,
  TransactionOriginType,
  TransactionType,
} from 'poki/src/features/transactions/types/transactionDetails'
import { WrapType } from 'poki/src/features/transactions/types/wrap'
import { call, put, select } from 'typed-redux-saga'
import { logger } from 'utilities/src/logger/logger'
import { isPrivateRpcSupportedOnChain } from 'wallet/src/features/providers/utils'
import { CalculatedNonce, sendTransaction, tryGetNonce } from 'wallet/src/features/transactions/sendTransactionSaga'
import { SubmitPokiXOrderParams, submitPokiXOrder } from 'wallet/src/features/transactions/swap/submitOrderSaga'
import { wrap } from 'wallet/src/features/transactions/swap/wrapSaga'
import { selectWalletSwapProtectionSetting } from 'wallet/src/features/wallet/selectors'
import { SwapProtectionSetting } from 'wallet/src/features/wallet/slice'
import { createMonitoredSaga } from 'wallet/src/utils/saga'

export type SwapParams = {
  txId?: string
  account: SignerMnemonicAccountMeta
  analytics: ReturnType<typeof getBaseTradeAnalyticsProperties>
  swapTxContext: ValidatedSwapTxContext
  onSuccess: () => void
  onFailure: () => void
}

export function* approveAndSwap(params: SwapParams) {
  let calculatedNonce: CalculatedNonce | undefined
  try {
    const { swapTxContext, account, txId, analytics, onSuccess, onFailure } = params
    const { approveTxRequest } = swapTxContext
    const isPokiXRouting = isPokiX(swapTxContext)
    const isBridge = swapTxContext.routing === Routing.BRIDGE
    const chainId = swapTxContext.trade.inputAmount.currency.chainId

    // For classic swaps, trigger UI changes immediately after click
    if (!isPokiXRouting) {
      // onSuccess does not need to be wrapped in yield* call() here, but doing so makes it easier to test call ordering in swapSaga.test.ts
      yield* call(onSuccess)
    }

    // MEV protection is not needed for PokiX approval and/or wrap transactions.
    // We disable for bridge to avoid any potential issues with BE checking status.
    const submitViaPrivateRpc = !isPokiXRouting && !isBridge && (yield* call(shouldSubmitViaPrivateRpc, chainId))
    // We must manually set the nonce when submitting multiple transactions in a row,
    // otherwise for some L2s the Provider might fetch the same nonce for both transactions.
    calculatedNonce = yield* call(tryGetNonce, account, chainId)
    let nonce = calculatedNonce?.nonce

    const gasFeeEstimation = swapTxContext.gasFeeEstimation

    let approveTxHash: string | undefined
    // Approval Logic
    if (approveTxRequest) {
      const typeInfo: ApproveTransactionInfo = {
        type: TransactionType.Approve,
        tokenAddress: approveTxRequest.to,
        spender: permit2Address(chainId),
        swapTxId: txId,
        gasEstimates: gasFeeEstimation?.approvalEstimates,
      }

      const options = { request: { ...approveTxRequest, nonce }, submitViaPrivateRpc }

      const sendTransactionParams = {
        chainId,
        account,
        options,
        typeInfo,
        analytics,
        transactionOriginType: TransactionOriginType.Internal,
      }

      // TODO(WEB-4406) - Refactor the approval submission's rpc call latency to not delay wrap submission
      approveTxHash = (yield* call(sendTransaction, sendTransactionParams)).transactionResponse.hash
      nonce = nonce ? nonce + 1 : undefined
    }

    // Default to input for USD volume amount
    const transactedUSDValue = analytics.token_in_amount_usd

    const typeInfo = tradeToTransactionInfo(swapTxContext.trade, transactedUSDValue, gasFeeEstimation?.swapEstimates)
    // Swap Logic - PokiX
    if (isPokiXRouting) {
      const { trade, wrapTxRequest, permit } = swapTxContext
      const { quote } = trade.quote

      let wrapTxHash: string | undefined
      // Wrap Logic - PokiX Eth-input
      if (wrapTxRequest) {
        const inputCurrencyAmount = trade.inputAmount
        const wrapResponse = yield* wrap({
          txRequest: { ...wrapTxRequest, nonce },
          account,
          inputCurrencyAmount,
          swapTxId: txId,
          skipPushNotification: true, // wrap is abstracted away in UX; we avoid showing a wrap notification
          gasEstimates: gasFeeEstimation?.wrapEstimates,
        })
        wrapTxHash = wrapResponse?.transactionResponse.hash
      }

      const submitOrderParams: SubmitPokiXOrderParams = {
        account,
        analytics,
        approveTxHash,
        wrapTxHash,
        permit,
        quote,
        routing: swapTxContext.routing,
        typeInfo,
        chainId,
        txId,
        onSuccess,
        onFailure,
      }
      yield* call(submitPokiXOrder, submitOrderParams)
    } else if (swapTxContext.routing === Routing.BRIDGE) {
      const options = { request: { ...swapTxContext.txRequest, nonce }, submitViaPrivateRpc }
      const sendTransactionParams = {
        txId,
        chainId,
        account,
        options,
        typeInfo,
        analytics,
        transactionOriginType: TransactionOriginType.Internal,
      }
      yield* call(sendTransaction, sendTransactionParams)
      yield* put(pushNotification({ type: AppNotificationType.SwapPending, wrapType: WrapType.NotApplicable }))
    } else if (swapTxContext.routing === Routing.CLASSIC) {
      const options = { request: { ...swapTxContext.txRequest, nonce }, submitViaPrivateRpc }
      const sendTransactionParams = {
        txId,
        chainId,
        account,
        options,
        typeInfo,
        analytics,
        transactionOriginType: TransactionOriginType.Internal,
      }
      yield* call(sendTransaction, sendTransactionParams)
      yield* put(pushNotification({ type: AppNotificationType.SwapPending, wrapType: WrapType.NotApplicable }))
    }
  } catch (error) {
    logger.error(error, {
      tags: { file: 'swapSaga', function: 'approveAndSwap' },
      extra: { analytics: params.analytics, calculatedNonce },
    })
  }
}

export const {
  name: swapSagaName,
  wrappedSaga: swapSaga,
  reducer: swapReducer,
  actions: swapActions,
} = createMonitoredSaga(approveAndSwap, 'swap')

export function* shouldSubmitViaPrivateRpc(chainId: number) {
  const swapProtectionSetting = yield* select(selectWalletSwapProtectionSetting)
  const swapProtectionOn = swapProtectionSetting === SwapProtectionSetting.On
  const privateRpcFeatureEnabled = Statsig.checkGate(getFeatureFlagName(FeatureFlags.PrivateRpc))
  const privateRpcSupportedOnChain = chainId ? isPrivateRpcSupportedOnChain(chainId) : false
  return Boolean(swapProtectionOn && privateRpcSupportedOnChain && privateRpcFeatureEnabled)
}
