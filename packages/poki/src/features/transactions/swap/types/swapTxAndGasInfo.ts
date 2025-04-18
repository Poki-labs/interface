import { CreateSwapRequest, Routing, TransactionFailureReason } from 'poki/src/data/tradingApi/__generated__/index'
import { GasFeeResult, ValidatedGasFeeResult, validateGasFeeResult } from 'poki/src/features/gas/types'
import {
  BridgeTrade,
  ClassicTrade,
  IndicativeTrade,
  PokiXTrade,
} from 'poki/src/features/transactions/swap/types/trade'
import { isBridge, isClassic, isPokiX } from 'poki/src/features/transactions/swap/utils/routing'
import { ValidatedPermit, ValidatedTransactionRequest } from 'poki/src/features/transactions/swap/utils/trade'
import { GasFeeEstimates } from 'poki/src/features/transactions/types/transactionDetails'
import { isInterface } from 'utilities/src/platform'

export type SwapTxAndGasInfo = ClassicSwapTxAndGasInfo | PokiXSwapTxAndGasInfo | BridgeSwapTxAndGasInfo
export type ValidatedSwapTxContext =
  | ValidatedClassicSwapTxAndGasInfo
  | ValidatedPokiXSwapTxAndGasInfo
  | ValidatedBridgeSwapTxAndGasInfo

export function isValidSwapTxContext(
  swapTxContext: SwapTxAndGasInfo | unknown,
): swapTxContext is ValidatedSwapTxContext {
  // Validation fn prevents/future-proofs typeguard against illicit casts
  return validateSwapTxContext(swapTxContext) !== undefined
}

export type SwapGasFeeEstimation = {
  swapEstimates?: GasFeeEstimates
  approvalEstimates?: GasFeeEstimates
  wrapEstimates?: GasFeeEstimates
}

export type PokiXGasBreakdown = {
  classicGasUseEstimateUSD?: string
  approvalCost?: string
  wrapCost?: string
  inputTokenSymbol?: string
}

interface BaseSwapTxAndGasInfo {
  routing: Routing
  trade?: ClassicTrade | PokiXTrade | BridgeTrade
  indicativeTrade: IndicativeTrade | undefined
  approveTxRequest: ValidatedTransactionRequest | undefined
  permit: ValidatedPermit | undefined
  revocationTxRequest: ValidatedTransactionRequest | undefined
  gasFee: GasFeeResult
  gasFeeEstimation: SwapGasFeeEstimation
}

export interface ClassicSwapTxAndGasInfo extends BaseSwapTxAndGasInfo {
  routing: Routing.CLASSIC
  trade?: ClassicTrade
  swapRequestArgs: CreateSwapRequest | undefined
  simulationErrors?: TransactionFailureReason[]
  /**
   * `unsigned` is true if `txRequest` is undefined due to a permit signature needing to be signed first.
   * This occurs on interface where the user must be prompted to sign a permit before txRequest can be fetched.
   */
  unsigned: boolean
  txRequest: ValidatedTransactionRequest | undefined
}

export interface PokiXSwapTxAndGasInfo extends BaseSwapTxAndGasInfo {
  routing: Routing.DUTCH_V2 | Routing.DUTCH_V3 | Routing.PRIORITY
  trade: PokiXTrade
  wrapTxRequest: ValidatedTransactionRequest | undefined
  gasFeeBreakdown: PokiXGasBreakdown
}

export interface BridgeSwapTxAndGasInfo extends BaseSwapTxAndGasInfo {
  routing: Routing.BRIDGE
  trade: BridgeTrade
  indicativeTrade: undefined
  swapRequestArgs: CreateSwapRequest | undefined
  gasFeeEstimation: SwapGasFeeEstimation

  /**
   * `unsigned` is true if `txRequest` is undefined due to a permit signature needing to be signed first.
   * This occurs on interface where the user must be prompted to sign a permit before txRequest can be fetched.
   */
  unsigned: boolean
  txRequest: ValidatedTransactionRequest | undefined
}

interface BaseRequiredSwapTxContextFields {
  gasFee: ValidatedGasFeeResult
}

export type ValidatedClassicSwapTxAndGasInfo = Omit<Required<ClassicSwapTxAndGasInfo>, 'simulationErrors'> & {
  simulationErrors?: ClassicSwapTxAndGasInfo['simulationErrors']
} & BaseRequiredSwapTxContextFields &
  (
    | {
        unsigned: true
        permit: ValidatedPermit
        txRequest: undefined
      }
    | {
        unsigned: false
        permit: undefined
        txRequest: ValidatedTransactionRequest
      }
  )

export type ValidatedBridgeSwapTxAndGasInfo = Required<BridgeSwapTxAndGasInfo> &
  BaseRequiredSwapTxContextFields &
  (
    | {
        unsigned: true
        permit: ValidatedPermit
        txRequest: undefined
      }
    | {
        unsigned: false
        permit: undefined
        txRequest: ValidatedTransactionRequest
      }
  )

export type ValidatedPokiXSwapTxAndGasInfo = Required<PokiXSwapTxAndGasInfo> &
  BaseRequiredSwapTxContextFields & {
    // Permit should always be defined for PokiX orders
    permit: ValidatedPermit
  }

function validateSwapTxContext(swapTxContext: SwapTxAndGasInfo | unknown): ValidatedSwapTxContext | undefined {
  if (!isSwapTx(swapTxContext)) {
    return undefined
  }

  const gasFee = validateGasFeeResult(swapTxContext.gasFee)
  if (!gasFee) {
    return undefined
  }

  if (swapTxContext.trade) {
    if (isClassic(swapTxContext)) {
      const { trade, txRequest, unsigned, permit } = swapTxContext

      if (unsigned) {
        // SwapTxContext should only ever be unsigned / still require a signature on interface.
        if (!isInterface || !permit) {
          return undefined
        }
        return { ...swapTxContext, trade, gasFee, unsigned, txRequest: undefined, permit }
      } else if (txRequest) {
        return { ...swapTxContext, trade, gasFee, unsigned, txRequest, permit: undefined }
      }
    } else if (isBridge(swapTxContext) && swapTxContext.txRequest) {
      const { trade, txRequest, unsigned, permit } = swapTxContext

      if (unsigned) {
        // SwapTxContext should only ever be unsigned / still require a signature on interface.
        if (!isInterface || !permit) {
          return undefined
        }
        return { ...swapTxContext, trade, gasFee, unsigned, txRequest: undefined, permit }
      } else if (txRequest) {
        return { ...swapTxContext, trade, gasFee, unsigned, txRequest, permit: undefined }
      }
    } else if (isPokiX(swapTxContext) && swapTxContext.permit) {
      const { trade, permit } = swapTxContext
      return { ...swapTxContext, trade, gasFee, permit }
    }
  }
  return undefined
}

function isSwapTx(swapTxContext: unknown): swapTxContext is SwapTxAndGasInfo {
  return (
    typeof swapTxContext === 'object' &&
    swapTxContext !== null &&
    'trade' in swapTxContext &&
    'routing' in swapTxContext
  )
}
