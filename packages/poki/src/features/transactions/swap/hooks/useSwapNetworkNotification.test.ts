import { act, renderHook } from '@testing-library/react-native'
import { usePokiContext } from 'poki/src/contexts/PokiContext'
import { UniverseChainId } from 'poki/src/features/chains/types'
import { useSwapNetworkNotification } from 'poki/src/features/transactions/swap/hooks/useSwapNetworkNotification'

jest.mock('poki/src/contexts/PokiContext', () => ({
  usePokiContext: jest.fn(),
}))

const onSwapChainsChangedMock = jest.fn()

;(usePokiContext as jest.Mock).mockReturnValue({
  onSwapChainsChanged: onSwapChainsChangedMock,
})

describe('useSwapNetworkNotification', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('does not show notification if input and output chain ids are the same', () => {
    const { rerender } = renderHook(
      ({ inputChainId, outputChainId }: { inputChainId?: UniverseChainId; outputChainId?: UniverseChainId }) =>
        useSwapNetworkNotification({ inputChainId, outputChainId }),
      {
        initialProps: {
          inputChainId: UniverseChainId.Mainnet,
          outputChainId: UniverseChainId.Mainnet,
        },
      },
    )

    act(() => {
      rerender({ inputChainId: UniverseChainId.Mainnet, outputChainId: UniverseChainId.Mainnet })
    })

    expect(onSwapChainsChangedMock).not.toHaveBeenCalled()
  })
  it('shows bridge notification when input and output chain ids change', () => {
    const { rerender } = renderHook(
      ({ inputChainId, outputChainId }: { inputChainId?: UniverseChainId; outputChainId?: UniverseChainId }) =>
        useSwapNetworkNotification({ inputChainId, outputChainId }),
      {
        initialProps: {
          inputChainId: UniverseChainId.Mainnet,
          outputChainId: UniverseChainId.Optimism,
        },
      },
    )

    act(() => {
      rerender({ inputChainId: UniverseChainId.Mainnet, outputChainId: UniverseChainId.Base })
    })

    expect(onSwapChainsChangedMock).toHaveBeenCalledWith({
      chainId: UniverseChainId.Mainnet,
      outputChainId: UniverseChainId.Base,
    })
  })
  it('shows swap notification if input or output chain id changes', () => {
    const { rerender } = renderHook(
      ({ inputChainId, outputChainId }: { inputChainId?: UniverseChainId; outputChainId?: UniverseChainId }) =>
        useSwapNetworkNotification({ inputChainId, outputChainId }),
      {
        initialProps: {
          inputChainId: UniverseChainId.Mainnet,
          outputChainId: UniverseChainId.Mainnet,
        } as { inputChainId?: UniverseChainId; outputChainId?: UniverseChainId },
      },
    )

    act(() => {
      rerender({ inputChainId: UniverseChainId.Optimism, outputChainId: undefined })
    })

    expect(onSwapChainsChangedMock).toHaveBeenCalledWith({
      chainId: UniverseChainId.Optimism,
      prevChainId: UniverseChainId.Mainnet,
    })

    act(() => {
      rerender({ inputChainId: undefined, outputChainId: UniverseChainId.Base })
    })

    expect(onSwapChainsChangedMock).toHaveBeenCalledWith({
      chainId: UniverseChainId.Base,
      prevChainId: UniverseChainId.Optimism,
    })
  })
})
