import { AxiosError } from 'axios'
import { BigNumber, providers } from 'ethers/lib/ethers'
import { PollingInterval } from 'poki/src/constants/misc'
import { MAX_AUTO_SLIPPAGE_TOLERANCE } from 'poki/src/constants/transactions'
import {
  BridgeQuoteResponse,
  ClassicQuoteResponse,
  DutchQuoteResponse,
  DutchV3QuoteResponse,
  PriorityQuoteResponse,
} from 'poki/src/data/apiClients/tradingApi/TradingApiClient'
import {
  DutchOrderInfoV2,
  DutchOrderInfoV3,
  IndicativeQuoteResponse,
  PriorityOrderInfo,
  Routing,
} from 'poki/src/data/tradingApi/__generated__/index'
import { AccountMeta } from 'poki/src/features/accounts/types'
import { ValueType, getCurrencyAmount } from 'poki/src/features/tokens/getCurrencyAmount'
import { getSwapFee } from 'poki/src/features/transactions/swap/types/getSwapFee'
import { FrontendSupportedProtocol } from 'poki/src/features/transactions/swap/utils/protocols'
import { GasFeeEstimates } from 'poki/src/features/transactions/types/transactionDetails'
import { Currency, CurrencyAmount, Percent, Price, TradeType } from 'poki/src/sdk-core'
import { Route as V3RouteSDK } from 'poki/src/v3-sdk'





export interface UseTradeArgs {
  account?: AccountMeta
  amountSpecified: Maybe<CurrencyAmount<Currency>>
  otherCurrency: Maybe<Currency>
  tradeType: TradeType
  pollInterval?: PollingInterval
  customSlippageTolerance?: number
  isUSDQuote?: boolean
  sendPortionEnabled?: boolean
  skip?: boolean
  selectedProtocols?: FrontendSupportedProtocol[]
  isDebouncing?: boolean
}

export type SwapFee = { recipient?: string; percent: Percent; amount: string }

export type SwapFeeInfo = {
  noFeeCharged: boolean
  formattedPercent: string
  formattedAmount: string
  formattedAmountFiat?: string
}

export enum ApprovalAction {
  // either native token or allowance is sufficient, no approval or permit needed
  None = 'none',

  // not enough allowance and token cannot be approved through .permit instead
  Approve = 'approve',

  // not enough allowance but token can be approved through permit signature
  Permit = 'permit',

  Permit2Approve = 'permit2-approve',

  // revoke required before token can be approved
  RevokeAndPermit2Approve = 'revoke-and-permit2-approve',

  // Unable to fetch approval status, should block submission UI
  Unknown = 'unknown',
}

export type TokenApprovalInfo =
  | {
      action: ApprovalAction.None | ApprovalAction.Permit | ApprovalAction.Unknown
      txRequest: null
      cancelTxRequest: null
    }
  | {
      action: ApprovalAction.Approve | ApprovalAction.Permit2Approve
      txRequest: providers.TransactionRequest
      cancelTxRequest: null
    }
  | {
      action: ApprovalAction.RevokeAndPermit2Approve
      txRequest: providers.TransactionRequest
      cancelTxRequest: providers.TransactionRequest
    }


type ValidatedIndicativeQuoteToken = Required<IndicativeQuoteResponse['input']>

export type ValidatedIndicativeQuoteResponse = IndicativeQuoteResponse & {
  input: ValidatedIndicativeQuoteToken
  output: ValidatedIndicativeQuoteToken
}

export function validateIndicativeQuoteResponse(
  response: IndicativeQuoteResponse,
): ValidatedIndicativeQuoteResponse | undefined {
  const { input, output } = response
  if (
    response.input &&
    response.output &&
    response.requestId &&
    response.type &&
    input.amount &&
    input.chainId &&
    input.token &&
    output.amount &&
    output.chainId &&
    output.token
  ) {
    return {
      ...response,
      input: { amount: input.amount, chainId: input.chainId, token: output.token },
      output: { amount: output.amount, chainId: output.chainId, token: output.token },
    }
  }
  return undefined
}

export class IndicativeTrade {
  quote: ValidatedIndicativeQuoteResponse
  inputAmount: CurrencyAmount<Currency>
  outputAmount: CurrencyAmount<Currency>
  executionPrice: Price<Currency, Currency>
  swapFee: undefined
  inputTax: undefined
  outputTax: undefined
  slippageTolerance?: number
  readonly indicative = true

  constructor({
    quote,
    currencyIn,
    currencyOut,
    slippageTolerance,
  }: {
    quote: ValidatedIndicativeQuoteResponse
    currencyIn: Currency
    currencyOut: Currency
    slippageTolerance?: number
  }) {
    this.quote = quote

    const inputAmount = getCurrencyAmount({
      value: this.quote.input.amount,
      valueType: ValueType.Raw,
      currency: currencyIn,
    })
    const outputAmount = getCurrencyAmount({
      value: this.quote.output.amount,
      valueType: ValueType.Raw,
      currency: currencyOut,
    })

    if (!inputAmount || !outputAmount) {
      throw new Error('Error parsing indicative quote currency amounts')
    }
    this.inputAmount = inputAmount
    this.outputAmount = outputAmount
    this.executionPrice = new Price(currencyIn, currencyOut, this.quote.input.amount, this.quote.output.amount)
    this.slippageTolerance = slippageTolerance
  }
}


