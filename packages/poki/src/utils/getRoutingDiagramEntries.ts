import { ClassicTrade } from 'poki/src/features/transactions/swap/types/trade'
import { Currency, Percent, TradeType } from 'poki/src/sdk-core'
import { FeeAmount, Pool as V3Pool } from 'poki/src/v3-sdk'

export interface RoutingDiagramEntry {
  percent: Percent
  path: [Currency, Currency, FeeAmount, Protocol][]
  protocol: Protocol
}

const V2_DEFAULT_FEE_TIER = 3000

/**
 * Loops through all routes on a trade and returns an array of diagram entries.
 */
export default function getRoutingDiagramEntries(trade: ClassicTrade): RoutingDiagramEntry[] {
  return trade.swaps.map(({ route: { path: tokenPath, pools, protocol }, inputAmount, outputAmount }) => {
    let portion
    if (trade.tradeType === TradeType.EXACT_OUTPUT) {
      portion = trade.inputAmount.greaterThan(ZERO) ? inputAmount.divide(trade.inputAmount) : new Percent(0)
    } else {
      portion = trade.outputAmount.greaterThan(ZERO) ? outputAmount.divide(trade.outputAmount) : new Percent(0)
    }
    const percent = new Percent(portion.numerator, portion.denominator)
    const path: RoutingDiagramEntry['path'] = []
    for (let i = 0; i < pools.length; i++) {
      const nextPool = pools[i]
      const tokenIn = tokenPath[i]
      const tokenOut = tokenPath[i + 1]

      if (!tokenIn || !tokenOut || !nextPool) {
        break
      }

      const poolProtocol =
        nextPool instanceof Pair ? Protocol.V2 : nextPool instanceof V3Pool ? Protocol.V3 : Protocol.V4

      const entry: RoutingDiagramEntry['path'][0] = [tokenIn, tokenOut, nextPool.fee, poolProtocol]
      path.push(entry)
    }
    return {
      percent,
      path,
      protocol,
    }
  })
}
