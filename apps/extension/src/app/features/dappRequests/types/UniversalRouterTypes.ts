import { FeeAmount as FeeAmountV3 } from 'poki/src/v3-sdk'
import { BigNumberSchema } from 'src/app/features/dappRequests/types/EthersTypes'
import { z } from 'zod'

// TODO: remove this fallback once params are fully typed or we are able to import them from the universal router sdk
const FallbackParamSchema = z.object({
  name: z.string(),
  // eslint-disable-next-line no-restricted-syntax
  value: z.any(),
})
export type FallbackParam = z.infer<typeof FallbackParamSchema>

const AmountInParamSchema = z.object({
  name: z.literal('amountIn'),
  value: BigNumberSchema,
})
export type AmountInParam = z.infer<typeof AmountInParamSchema>

const AmountInMaxParamSchema = z.object({
  name: z.literal('amountInMax'),
  value: BigNumberSchema,
})
export type AmountInMaxParam = z.infer<typeof AmountInMaxParamSchema>

const AmountOutMinParamSchema = z.object({
  name: z.literal('amountOutMin'),
  value: BigNumberSchema,
})
export type AmountOutMinParam = z.infer<typeof AmountOutMinParamSchema>

const AmountOutParamSchema = z.object({
  name: z.literal('amountOut'),
  value: BigNumberSchema,
})
export type AmountOutParam = z.infer<typeof AmountOutParamSchema>

const AmountMinParamSchema = z.object({
  name: z.literal('amountMin'),
  value: BigNumberSchema,
})
export type AmountMinParam = z.infer<typeof AmountMinParamSchema>

const FeeAmountSchema = z.nativeEnum(FeeAmountV3)
export type FeeAmount = z.infer<typeof FeeAmountSchema>

const V3PathParamSchema = z.object({
  name: z.literal('path'),
  value: z.array(
    z.object({
      tokenIn: z.string().refine((val) => val.startsWith('0x'), {
        message: "tokenIn must start with '0x'",
      }),
      tokenOut: z.string().refine((val) => val.startsWith('0x'), {
        message: "tokenOut must start with '0x'",
      }),
      fee: FeeAmountSchema,
    }),
  ),
})
export type V3Path = z.infer<typeof V3PathParamSchema>

// V4 PARAMS

// Define PoolKey which is used for the exact single swaps
const PoolKeySchema = z.object({
  currency0: z.string().refine((val) => val.startsWith('0x'), {
    message: "currency0 must start with '0x'",
  }),
  currency1: z.string().refine((val) => val.startsWith('0x'), {
    message: "currency1 must start with '0x'",
  }),
  fee: z.number(),
  tickSpacing: z.number(),
  hooks: z.string(),
})

// V4 SWAP_EXACT_IN_SINGLE
const V4SwapExactInSingleSwapSchema = z.object({
  poolKey: PoolKeySchema,
  zeroForOne: z.boolean(),
  amountIn: BigNumberSchema,
  amountOutMinimum: BigNumberSchema,
  sqrtPriceLimitX96: BigNumberSchema,
  hookData: z.string(),
})

export const V4SwapExactInSingleParamSchema = z.object({
  name: z.literal('SWAP_EXACT_IN_SINGLE'),
  value: z.array(
    z.object({
      name: z.literal('swap'),
      value: V4SwapExactInSingleSwapSchema,
    }),
  ),
})
export type V4SwapExactInSingleParam = z.infer<typeof V4SwapExactInSingleParamSchema>

// V4 SWAP_EXACT_OUT_SINGLE
const SwapExactOutSingleSwapSchema = z.object({
  poolKey: PoolKeySchema,
  zeroForOne: z.boolean(),
  amountOut: BigNumberSchema,
  amountInMaximum: BigNumberSchema,
  sqrtPriceLimitX96: BigNumberSchema,
  hookData: z.string(),
})

export const V4SwapExactOutSingleParamSchema = z.object({
  name: z.literal('SWAP_EXACT_OUT_SINGLE'),
  value: z.array(
    z.object({
      name: z.literal('swap'),
      value: SwapExactOutSingleSwapSchema,
    }),
  ),
})
export type V4SwapExactOutSingleParam = z.infer<typeof V4SwapExactOutSingleParamSchema>

// Define PathKey which is used for exact swaps with multiple hops
const PathKeySchema = z.object({
  intermediateCurrency: z.string().refine((val) => val.startsWith('0x'), {
    message: "intermediateCurrency must start with '0x'",
  }),
  fee: z.number(),
  tickSpacing: z.number(),
  hooks: z.string().refine((val) => val.startsWith('0x'), {
    message: "hooks must start with '0x'",
  }),
  hookData: z.string(),
})

// V4 SWAP_EXACT_IN
const V4SwapExactInSchema = z.object({
  currencyIn: z.string().refine((val) => val.startsWith('0x'), {
    message: "currencyIn must start with '0x'",
  }),
  path: z.array(PathKeySchema),
  amountIn: BigNumberSchema,
  amountOutMinimum: BigNumberSchema,
})

export const V4SwapExactInParamSchema = z.object({
  name: z.literal('SWAP_EXACT_IN'),
  value: z.array(
    z.object({
      name: z.literal('swap'),
      value: V4SwapExactInSchema,
    }),
  ),
})
export type V4SwapExactInParam = z.infer<typeof V4SwapExactInParamSchema>

// V4 SWAP_EXACT_OUT
const V4SwapExactOutSchema = z.object({
  currencyOut: z.string().refine((val) => val.startsWith('0x'), {
    message: "currencyOut must start with '0x'",
  }),
  path: z.array(PathKeySchema),
  amountOut: BigNumberSchema,
  amountInMaximum: BigNumberSchema,
})

export const V4SwapExactOutParamSchema = z.object({
  name: z.literal('SWAP_EXACT_OUT'),
  value: z.array(
    z.object({
      name: z.literal('swap'),
      value: V4SwapExactOutSchema,
    }),
  ),
})
export type V4SwapExactOutParam = z.infer<typeof V4SwapExactOutParamSchema>

// END V4 PARAMS

const PayerIsUserParamSchema = z.object({
  name: z.literal('payerIsUser'),
  value: z.boolean(),
})
export type PayerIsUserParam = z.infer<typeof PayerIsUserParamSchema>

export const ParamSchema = z.union([
  AmountInParamSchema,
  AmountInMaxParamSchema,
  AmountOutParamSchema,
  AmountOutMinParamSchema,
  AmountMinParamSchema,
  V3PathParamSchema,
  PayerIsUserParamSchema,
  FallbackParamSchema,
])
export type Param = z.infer<typeof ParamSchema>

export function isAmountInParam(param: Param): param is AmountInParam {
  return AmountInParamSchema.safeParse(param).success
}

export function isAmountInMaxParam(param: Param): param is AmountInMaxParam {
  return AmountInMaxParamSchema.safeParse(param).success
}

export function isAmountOutMinParam(param: Param): param is AmountOutMinParam {
  return AmountOutMinParamSchema.safeParse(param).success
}

export function isAmountOutParam(param: Param): param is AmountOutParam {
  return AmountOutParamSchema.safeParse(param).success
}

export function isAmountMinParam(param: Param): param is AmountMinParam {
  return AmountMinParamSchema.safeParse(param).success
}
