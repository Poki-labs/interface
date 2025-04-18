import { NetworkFilter } from 'poki/src/components/network/NetworkFilter'
import { SUPPORTED_CHAIN_IDS } from 'poki/src/features/chains/types'
import { renderWithProviders } from 'poki/src/test/render'
import { act } from 'poki/src/test/test-utils'
import ReactDOM from 'react-dom'

ReactDOM.createPortal = jest.fn((element) => {
  return element as React.ReactPortal
})

jest.mock('poki/src/features/unichain/hooks/useUnichainTooltipVisibility', () => {
  return {
    useUnichainTooltipVisibility: (): { shouldShowUnichainNetworkSelectorTooltip: boolean } => {
      return { shouldShowUnichainNetworkSelectorTooltip: true }
    },
  }
})

describe(NetworkFilter, () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('renders a NetworkFilter', async () => {
    const tree = renderWithProviders(
      <NetworkFilter chainIds={SUPPORTED_CHAIN_IDS} selectedChain={null} onPressChain={() => null} />,
    )

    await act(async () => {
      jest.runAllTimers()
    })

    expect(tree).toMatchSnapshot()
  })
})
