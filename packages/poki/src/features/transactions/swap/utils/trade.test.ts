import { POKI, WBTC } from 'poki/src/constants/tokens'
import { Routing } from 'poki/src/data/tradingApi/__generated__'
import { UniverseChainId } from 'poki/src/features/chains/types'
import { BridgeTrade, ClassicTrade } from 'poki/src/features/transactions/swap/types/trade'
import { requireAcceptNewTrade } from 'poki/src/features/transactions/swap/utils/trade'
import { Currency, CurrencyAmount, TradeType } from 'poki/src/sdk-core'
import { FeeAmount, Pool, Route } from 'poki/src/v3-sdk'

export const mockPool = new Pool(
  POKI[UniverseChainId.Mainnet],
  WBTC,
  FeeAmount.HIGH,
  '2437312313659959819381354528',
  '10272714736694327408',
  -69633,
)

describe(requireAcceptNewTrade, () => {
  describe('ClassicTrade', () => {
    const oldTrade = new ClassicTrade({
      v4Routes: [],
      v3Routes: [
        {
          routev3: new Route<Currency, Currency>([mockPool], POKI[UniverseChainId.Mainnet], WBTC),
          inputAmount: CurrencyAmount.fromRawAmount(POKI[UniverseChainId.Mainnet], 1000),
          outputAmount: CurrencyAmount.fromRawAmount(WBTC, 1000),
        },
      ],
      v2Routes: [],
      mixedRoutes: [],
      tradeType: TradeType.EXACT_INPUT,
      deadline: Date.now() + 60 * 30 * 1000,
    })

    it('returns false when prices are within threshold', () => {
      const newTrade = new ClassicTrade({
        v4Routes: [],
        v3Routes: [
          {
            routev3: new Route<Currency, Currency>([mockPool], POKI[UniverseChainId.Mainnet], WBTC),
            inputAmount: CurrencyAmount.fromRawAmount(POKI[UniverseChainId.Mainnet], 1000),
            // Update this number if `ACCEPT_NEW_TRADE_THRESHOLD` changes
            outputAmount: CurrencyAmount.fromRawAmount(WBTC, 990),
          },
        ],
        v2Routes: [],
        mixedRoutes: [],
        tradeType: TradeType.EXACT_INPUT,
        deadline: Date.now() + 60 * 30 * 1000,
      })
      expect(requireAcceptNewTrade(oldTrade, newTrade)).toBe(false)
    })

    it('returns true when prices move above threshold', () => {
      const newTrade = new ClassicTrade({
        v4Routes: [],
        v3Routes: [
          {
            routev3: new Route<Currency, Currency>([mockPool], POKI[UniverseChainId.Mainnet], WBTC),
            inputAmount: CurrencyAmount.fromRawAmount(POKI[UniverseChainId.Mainnet], 1000),
            // Update this number if `ACCEPT_NEW_TRADE_THRESHOLD` changes
            outputAmount: CurrencyAmount.fromRawAmount(WBTC, 979),
          },
        ],
        v2Routes: [],
        mixedRoutes: [],
        tradeType: TradeType.EXACT_INPUT,
        deadline: Date.now() + 60 * 30 * 1000,
      })
      expect(requireAcceptNewTrade(oldTrade, newTrade)).toBe(true)
    })

    it('returns false when new price is better', () => {
      const newTrade = new ClassicTrade({
        v4Routes: [],
        v3Routes: [
          {
            routev3: new Route<Currency, Currency>([mockPool], POKI[UniverseChainId.Mainnet], WBTC),
            inputAmount: CurrencyAmount.fromRawAmount(POKI[UniverseChainId.Mainnet], 1000),
            outputAmount: CurrencyAmount.fromRawAmount(WBTC, 2000000),
          },
        ],
        v2Routes: [],
        mixedRoutes: [],
        tradeType: TradeType.EXACT_INPUT,
        deadline: Date.now() + 60 * 30 * 1000,
      })
      expect(requireAcceptNewTrade(oldTrade, newTrade)).toBe(false)
    })
  })

  describe('BridgeTrade', () => {
    const oldTrade = new BridgeTrade({
      quote: {
        quote: {
          input: {
            amount: '1000',
          },
          output: {
            amount: '990',
          },
        },
        requestId: '123',
        routing: Routing.BRIDGE,
        permitData: null,
      },
      currencyIn: POKI[UniverseChainId.Mainnet],
      currencyOut: WBTC,
      tradeType: TradeType.EXACT_INPUT,
    })

    it('returns false when output amount is within threshold', () => {
      const newTrade = new BridgeTrade({
        quote: {
          quote: {
            input: {
              amount: '1000',
            },
            output: {
              amount: '981',
            },
          },
          requestId: '123',
          routing: Routing.BRIDGE,
          permitData: null,
        },
        currencyIn: POKI[UniverseChainId.Mainnet],
        currencyOut: WBTC,
        tradeType: TradeType.EXACT_INPUT,
      })
      expect(requireAcceptNewTrade(oldTrade, newTrade)).toBe(false)
    })

    it('returns true when output amount is below threshold', () => {
      const newTrade = new BridgeTrade({
        quote: {
          quote: {
            input: {
              amount: '1000',
            },
            output: {
              amount: '979',
            },
          },
          requestId: '123',
          routing: Routing.BRIDGE,
          permitData: null,
        },
        currencyIn: POKI[UniverseChainId.Mainnet],
        currencyOut: WBTC,
        tradeType: TradeType.EXACT_INPUT,
      })
      expect(requireAcceptNewTrade(oldTrade, newTrade)).toBe(true)
    })

    it('returns false when new trade is better', () => {
      const newTrade = new BridgeTrade({
        quote: {
          quote: {
            input: {
              amount: '1000',
            },
            output: {
              amount: '1001',
            },
          },
          requestId: '123',
          routing: Routing.BRIDGE,
          permitData: null,
        },
        currencyIn: POKI[UniverseChainId.Mainnet],
        currencyOut: WBTC,
        tradeType: TradeType.EXACT_INPUT,
      })
      expect(requireAcceptNewTrade(oldTrade, newTrade)).toBe(false)
    })
  })
})
