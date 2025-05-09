import { UniverseChainId } from 'poki/src/features/chains/types'
import { NativeCurrency } from 'poki/src/features/tokens/NativeCurrency'
import { getWrapType } from 'poki/src/features/transactions/swap/utils/wrap'
import { WrapType } from 'poki/src/features/transactions/types/wrap'
import { wrappedNativeCurrency } from 'poki/src/utils/currency'

describe(getWrapType, () => {
  const eth = NativeCurrency.onChain(UniverseChainId.Mainnet)
  const weth = wrappedNativeCurrency(UniverseChainId.Mainnet)

  const arbEth = NativeCurrency.onChain(UniverseChainId.ArbitrumOne)
  const arbWeth = wrappedNativeCurrency(UniverseChainId.ArbitrumOne)

  it('handles undefined args', () => {
    expect(getWrapType(undefined, weth)).toEqual(WrapType.NotApplicable)
    expect(getWrapType(weth, undefined)).toEqual(WrapType.NotApplicable)
    expect(getWrapType(undefined, undefined)).toEqual(WrapType.NotApplicable)
  })

  it('handles wrap', () => {
    expect(getWrapType(eth, weth)).toEqual(WrapType.Wrap)

    // different chains
    expect(getWrapType(arbEth, weth)).toEqual(WrapType.NotApplicable)
    expect(getWrapType(eth, arbWeth)).toEqual(WrapType.NotApplicable)
  })

  it('handles unwrap', () => {
    expect(getWrapType(weth, eth)).toEqual(WrapType.Unwrap)

    // different chains
    expect(getWrapType(weth, arbEth)).toEqual(WrapType.NotApplicable)
    expect(getWrapType(arbWeth, eth)).toEqual(WrapType.NotApplicable)
  })
})
