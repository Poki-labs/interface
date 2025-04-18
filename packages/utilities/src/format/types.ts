export enum NumberType {
  // used for token quantities in non-transaction contexts (e.g. portfolio balances)
  TokenNonTx = 'token-non-tx',

  // used for token quantities in transaction contexts (e.g. swap, send)
  TokenTx = 'token-tx',

  // this formatter is used for displaying swap price conversions
  // below the input/output amounts
  SwapPrice = 'swap-price',

  // this formatter is only used for displaying the swap trade output amount
  // in the text input boxes. Output amounts on review screen should use the above TokenTx formatter
  SwapTradeAmount = 'swap-trade-amount',

  // fiat number that uses standard formatting without any specific rules
  FiatStandard = 'fiat-standard',

  // fiat prices in any component that belongs in the Token Details flow (except for token stats)
  FiatTokenDetails = 'fiat-token-details',

  // fiat prices everywhere except Token Details flow
  FiatTokenPrice = 'fiat-token-price',

  // fiat values for market cap, TVL, volume in the Token Details screen
  FiatTokenStats = 'fiat-token-stats',

  // fiat price of token balances
  FiatTokenQuantity = 'fiat-token-quantity',

  // fiat gas prices
  FiatGasPrice = 'fiat-gas-price',

  // portfolio balance
  PortfolioBalance = 'portfolio-balance',

  // nft floor price denominated in a token (e.g, ETH)
  NFTTokenFloorPrice = 'nft-token-floor-price',

  // nft collection stats like number of items, holder, and sales
  NFTCollectionStats = 'nft-collection-stats',

  Percentage = 'percentage',
}
export type FiatNumberType = Extract<
  NumberType,
  | NumberType.FiatTokenPrice
  | NumberType.FiatTokenDetails
  | NumberType.FiatTokenStats
  | NumberType.FiatTokenQuantity
  | NumberType.FiatGasPrice
  | NumberType.PortfolioBalance
  | NumberType.FiatStandard
>

export enum ResultStatus {
  ERROR = 'err',
  OK = 'ok',
}

export type ApiResult<T> = undefined | T

export type Null = null | undefined

export type Override<P, S> = Omit<P, keyof S> & S

export type ActorIdentity = true

export type StatusResult<T> = {
  readonly status: ResultStatus
  readonly data?: T
  readonly message: string
}

export type CallResult<T> = {
  readonly result: ApiResult<T>
  readonly loading: boolean
}

export type PaginationResult<T> = {
  totalElements: number
  offset: number
  limit: number
  content: T[]
}
