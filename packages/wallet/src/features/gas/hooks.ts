import { BigNumber, providers } from 'ethers'
import { TRANSACTION_CANCELLATION_GAS_FACTOR } from 'poki/src/constants/transactions'
import { FeeType } from 'poki/src/data/tradingApi/types'
import { useTransactionGasFee } from 'poki/src/features/gas/hooks'
import { isClassic, isPokiX } from 'poki/src/features/transactions/swap/utils/routing'
import { TransactionDetails } from 'poki/src/features/transactions/types/transactionDetails'
import { useCallback, useMemo } from 'react'
import { logger } from 'utilities/src/logger/logger'
import { useAsyncData } from 'utilities/src/react/hooks'
import { FeeDetails, getAdjustedGasFeeDetails } from 'wallet/src/features/gas/adjustGasFee'
import { getCancelOrderTxRequest } from 'wallet/src/features/transactions/cancelTransactionSaga'

export type CancelationGasFeeDetails = {
  cancelRequest: providers.TransactionRequest
  cancelationGasFeeDisplayValue: string
}

/**
 * Construct cancelation transaction with increased gas (based on current network conditions),
 * then use it to compute new gas info.
 */
export function useCancelationGasFeeInfo(transaction: TransactionDetails): CancelationGasFeeDetails | undefined {
  const classicCancelRequest = useMemo(() => {
    return {
      chainId: transaction.chainId,
      from: transaction.from,
      to:
        // Flashbots requires the cancelation transaction to be sent to the same address as the original transaction
        // https://docs.flashbots.net/flashbots-protect/cancellations
        isClassic(transaction) &&
        transaction.options.privateRpcProvider === 'flashbots' &&
        transaction.options.request.to
          ? transaction.options.request.to
          : transaction.from,
      value: '0x0',
    }
  }, [transaction])

  const isPokiXTx = isPokiX(transaction)

  const pokiXCancelRequest = usePokiXCancelRequest(transaction)
  const pokiXGasFee = useTransactionGasFee(pokiXCancelRequest?.data, !isPokiXTx)

  const baseTxGasFee = useTransactionGasFee(classicCancelRequest, /* skip = */ isPokiXTx)
  return useMemo(() => {
    if (isPokiXTx) {
      if (!pokiXCancelRequest.data || !pokiXGasFee.value || !pokiXGasFee.displayValue) {
        return undefined
      }
      return {
        cancelRequest: pokiXCancelRequest.data,
        cancelationGasFeeDisplayValue: pokiXGasFee.displayValue,
      }
    }

    if (!baseTxGasFee.params || !baseTxGasFee.value || !baseTxGasFee.displayValue) {
      return undefined
    }

    let adjustedFeeDetails: FeeDetails | undefined
    try {
      adjustedFeeDetails = getAdjustedGasFeeDetails(
        transaction.options.request,
        baseTxGasFee.params,
        TRANSACTION_CANCELLATION_GAS_FACTOR,
      )
    } catch (error) {
      logger.error(error, {
        tags: { file: 'features/gas/hooks.ts', function: 'getAdjustedGasFeeDetails' },
        extra: { request: transaction.options.request, currentGasFeeParams: baseTxGasFee.params },
      })
      return undefined
    }

    const cancelRequest = {
      ...classicCancelRequest,
      ...adjustedFeeDetails.params,
      gasLimit: baseTxGasFee.params.gasLimit,
    }

    const cancelationGasFeeDisplayValue = getCancellationGasFeeDisplayValue(
      adjustedFeeDetails,
      baseTxGasFee.params.gasLimit,
      baseTxGasFee.value,
      baseTxGasFee.displayValue,
    )

    return {
      cancelRequest,
      cancelationGasFeeDisplayValue,
    }
  }, [
    isPokiXTx,
    baseTxGasFee.params,
    baseTxGasFee.value,
    baseTxGasFee.displayValue,
    classicCancelRequest,
    transaction,
    pokiXCancelRequest.data,
    pokiXGasFee.value,
    pokiXGasFee.displayValue,
  ])
}

function getCancellationGasFeeDisplayValue(
  adjustedFeeDetails: FeeDetails,
  gasLimit: string,
  previousValue: string,
  previousDisplayValue: string,
): string {
  // Use the original ratio of displayValue to value to maintain consistency with original gas fees
  return getCancelationGasFee(adjustedFeeDetails, gasLimit).mul(previousDisplayValue).div(previousValue).toString()
}

function getCancelationGasFee(adjustedFeeDetails: FeeDetails, gasLimit: string): BigNumber {
  // doing object destructuring here loses ts checks based on FeeDetails.type >:(
  if (adjustedFeeDetails.type === FeeType.LEGACY) {
    return BigNumber.from(gasLimit).mul(adjustedFeeDetails.params.gasPrice)
  }

  return BigNumber.from(adjustedFeeDetails.params.maxFeePerGas).mul(gasLimit)
}

function usePokiXCancelRequest(transaction: TransactionDetails): {
  isLoading: boolean
  data: providers.TransactionRequest | undefined
  error?: Error
} {
  const cancelRequestFetcher = useCallback(() => {
    if (!isPokiX(transaction)) {
      return undefined
    }
    return getCancelOrderTxRequest(transaction)
  }, [transaction])

  return useAsyncData(cancelRequestFetcher)
}
