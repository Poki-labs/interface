import { hasSufficientFundsIncludingGas } from 'poki/src/features/gas/utils'
import { CurrencyAmount } from 'poki/src/sdk-core'
import { MAINNET_CURRENCY } from 'poki/src/test/fixtures'

const ZERO_ETH = CurrencyAmount.fromRawAmount(MAINNET_CURRENCY, 0)
const ONE_ETH = CurrencyAmount.fromRawAmount(MAINNET_CURRENCY, 1e18)
const TEN_ETH = ONE_ETH.multiply(10)

describe(hasSufficientFundsIncludingGas, () => {
  it('correctly returns when there is enough for gas with no tx value', () => {
    const mockParams = {
      transactionAmount: undefined,
      gasFee: '1000',
      nativeCurrencyBalance: ONE_ETH,
    }

    expect(hasSufficientFundsIncludingGas(mockParams)).toBe(true)
  })

  it('correctly returns when there is enough for gas even with tx value', () => {
    const mockParams = {
      transactionAmount: ONE_ETH,
      gasFee: '1000',
      nativeCurrencyBalance: TEN_ETH,
    }

    expect(hasSufficientFundsIncludingGas(mockParams)).toBe(true)
  })

  it('correctly returns when there is not enough gas with no tx value', () => {
    const mockParams = {
      transactionAmount: undefined,
      gasFee: '1000',
      nativeCurrencyBalance: ZERO_ETH,
    }

    expect(hasSufficientFundsIncludingGas(mockParams)).toBe(false)
  })

  it('correctly returns when there is not enough gas with a tx value', () => {
    const mockParams = {
      transactionAmount: ONE_ETH,
      gasFee: '1000',
      nativeCurrencyBalance: ZERO_ETH,
    }

    expect(hasSufficientFundsIncludingGas(mockParams)).toBe(false)
  })
})
