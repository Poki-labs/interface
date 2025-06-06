import { Routing } from 'poki/src/data/tradingApi/__generated__/index'
import { AccountMeta } from 'poki/src/features/accounts/types'
import { GasFeeResult } from 'poki/src/features/gas/types'
import { useTokenApprovalInfo } from 'poki/src/features/transactions/swap/hooks/useTokenApprovalInfo'
import { useTransactionRequestInfo } from 'poki/src/features/transactions/swap/hooks/useTransactionRequestInfo'
import { DerivedSwapInfo } from 'poki/src/features/transactions/swap/types/derivedSwapInfo'
import {
  PokiXGasBreakdown,
  SwapGasFeeEstimation,
  SwapTxAndGasInfo,
} from 'poki/src/features/transactions/swap/types/swapTxAndGasInfo'
import { ApprovalAction, Trade } from 'poki/src/features/transactions/swap/types/trade'
import { sumGasFees } from 'poki/src/features/transactions/swap/utils/gas'
import { isPokiX } from 'poki/src/features/transactions/swap/utils/routing'
import { validatePermit, validateTransactionRequest } from 'poki/src/features/transactions/swap/utils/trade'
import { CurrencyField } from 'poki/src/types/currency'
import { useMemo } from 'react'
import { isInterface } from 'utilities/src/platform'

export function useSwapTxAndGasInfo({
  derivedSwapInfo,
  account,
}: {
  derivedSwapInfo: DerivedSwapInfo
  account?: AccountMeta
}): SwapTxAndGasInfo {
  const {
    chainId,
    wrapType,
    currencyAmounts,
    trade: { trade, indicativeTrade },
  } = derivedSwapInfo

  const tokenApprovalInfo = useTokenApprovalInfo({
    account,
    chainId,
    wrapType,
    currencyInAmount: currencyAmounts[CurrencyField.INPUT],
    currencyOutAmount: currencyAmounts[CurrencyField.OUTPUT],
    routing: trade?.routing,
  })

  const { currencyBalances } = derivedSwapInfo
  const currencyAmount = currencyAmounts[CurrencyField.INPUT]
  const currencyBalance = currencyBalances[CurrencyField.INPUT]

  const exceedsMaxAmount = Boolean(currencyBalance && currencyAmount && currencyBalance.lessThan(currencyAmount))

  // TODO(MOB-3425) decouple wrap tx from swap tx to simplify PokiX code
  const swapTxInfo = useTransactionRequestInfo({
    account,
    derivedSwapInfo,
    // Dont send transaction request if invalid or missing approval data, or if amount exceeds maximum
    skip: !tokenApprovalInfo?.action || tokenApprovalInfo.action === ApprovalAction.Unknown || exceedsMaxAmount,
    tokenApprovalInfo,
  })

  return useMemo(() => {
    const gasFeeEstimation: SwapGasFeeEstimation = {
      ...swapTxInfo.gasEstimate,
      approvalEstimates: tokenApprovalInfo?.gasEstimates,
    }

    // Gas fees for: swap from quote response directly, wrap from Gas Fee API, approvals from checkApprovalQuery
    const gasFee = getTotalGasFee(trade, swapTxInfo.gasFeeResult, tokenApprovalInfo, account)

    const approveTxRequest = validateTransactionRequest(tokenApprovalInfo?.txRequest)
    const revocationTxRequest = validateTransactionRequest(tokenApprovalInfo?.cancelTxRequest)
    const txRequest = validateTransactionRequest(swapTxInfo.transactionRequest)
    const permit = validatePermit(swapTxInfo.permitData)
    const unsigned = Boolean(isInterface && swapTxInfo.permitData)

    if (
      trade?.routing === Routing.DUTCH_V2 ||
      trade?.routing === Routing.DUTCH_V3 ||
      trade?.routing === Routing.PRIORITY
    ) {
      const signature = swapTxInfo.permitSignature
      const orderParams = signature ? { signature, quote: trade.quote.quote, routing: Routing.DUTCH_V2 } : undefined
      const gasFeeBreakdown: PokiXGasBreakdown = {
        classicGasUseEstimateUSD: trade.quote.quote.classicGasUseEstimateUSD,
        approvalCost: tokenApprovalInfo?.displayGasFee,
        wrapCost: swapTxInfo.gasFeeResult.displayValue,
        inputTokenSymbol: trade.inputAmount.currency.wrapped.symbol,
      }

      return {
        routing: trade.routing,
        trade,
        indicativeTrade,
        wrapTxRequest: txRequest,
        approveTxRequest,
        revocationTxRequest,
        orderParams,
        gasFee,
        gasFeeEstimation,
        gasFeeBreakdown,
        permit,
      }
    } else if (trade?.routing === Routing.BRIDGE) {
      return {
        routing: Routing.BRIDGE,
        trade,
        indicativeTrade: undefined, // Bridge trades don't have indicative trades
        txRequest,
        approveTxRequest,
        revocationTxRequest,
        gasFee,
        gasFeeEstimation,
        swapRequestArgs: swapTxInfo.swapRequestArgs,
        permit,
        unsigned,
      }
    } else {
      return {
        routing: Routing.CLASSIC,
        trade: trade ?? undefined,
        indicativeTrade,
        txRequest,
        approveTxRequest,
        revocationTxRequest,
        gasFee,
        gasFeeEstimation,
        swapRequestArgs: swapTxInfo.swapRequestArgs,
        permit,
        unsigned,
      }
    }
  }, [
    account,
    indicativeTrade,
    swapTxInfo.gasEstimate,
    swapTxInfo.gasFeeResult,
    swapTxInfo.permitSignature,
    swapTxInfo.transactionRequest,
    swapTxInfo.permitData,
    swapTxInfo.swapRequestArgs,
    tokenApprovalInfo,
    trade,
  ])
}

type TokenApprovalInfoWithGas = ReturnType<typeof useTokenApprovalInfo>
function getTotalGasFee(
  trade: Trade | null,
  swapGasResult: GasFeeResult,
  tokenApprovalInfo: TokenApprovalInfoWithGas,
  account?: AccountMeta,
): GasFeeResult {
  const isConnected = !!account?.address
  const blockingUnknownApprovalStatus = isConnected && tokenApprovalInfo.action === ApprovalAction.Unknown
  const isLoading = swapGasResult.isLoading || (blockingUnknownApprovalStatus && tokenApprovalInfo.isLoading)

  const approvalError =
    blockingUnknownApprovalStatus && !tokenApprovalInfo.isLoading ? new Error('Approval action unknown') : null
  let error = swapGasResult.error ?? approvalError

  // If swap requires revocation we expect simulation error so set error to null
  if (tokenApprovalInfo?.action === ApprovalAction.RevokeAndPermit2Approve) {
    error = null
  }

  const isGaslessSwap = trade && isPokiX(trade) && !trade.needsWrap
  const noApprovalNeeded = !isConnected || tokenApprovalInfo?.action === ApprovalAction.None
  const approvalGasFeeMissing = !tokenApprovalInfo
  const swapGasFeeMissing = !swapGasResult.value && !isGaslessSwap

  // For PokiX orders with no wrap and no approval, show total gas fee as 0.
  if (isGaslessSwap && noApprovalNeeded) {
    return { value: '0', displayValue: '0', error, isLoading }
  }

  // If user is disconnected, we don't have approval info, so use swapGasResult only for gas estimation
  if (!isConnected && !swapGasFeeMissing) {
    return swapGasResult
  }

  // Do not populate gas fee:
  // - If errors exist on swap or approval requests.
  // - If we don't have both the approval and transaction gas fees.
  if (approvalGasFeeMissing || swapGasFeeMissing || blockingUnknownApprovalStatus || error) {
    return { value: undefined, displayValue: undefined, error, isLoading }
  }

  const value = sumGasFees([swapGasResult.value, tokenApprovalInfo.gasFee, tokenApprovalInfo.cancelGasFee])
  const displayValue = sumGasFees([
    swapGasResult.displayValue,
    tokenApprovalInfo.displayGasFee,
    tokenApprovalInfo.displayCancelGasFee,
  ])
  return { value, displayValue, error, isLoading }
}
