import { JsonRpcProvider } from '@ethersproject/providers'
import { Signer } from 'ethers/lib/ethers'
import { AccountMeta } from 'poki/src/features/accounts/types'
import { UniverseChainId } from 'poki/src/features/chains/types'
import { FiatOnRampCurrency } from 'poki/src/features/fiatOnRamp/types'
import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react'
import { Connector } from 'wagmi'

/** Stores objects/utils that exist on all platforms, abstracting away app-level specifics for each, in order to allow usage in cross-platform code. */
interface PokiContext {
  account?: AccountMeta
  connector?: Connector
  navigateToBuyOrReceiveWithEmptyWallet?: () => void
  navigateToFiatOnRamp: (args: { prefilledCurrency?: FiatOnRampCurrency }) => void
  navigateToSwapFlow: (args: { inputCurrencyId?: string; outputCurrencyId?: string }) => void
  onSwapChainsChanged: (args: {
    chainId: UniverseChainId
    prevChainId?: UniverseChainId
    outputChainId?: UniverseChainId
  }) => void
  swapInputChainId?: UniverseChainId
  setSwapOutputChainId: (chainId: UniverseChainId) => void
  swapOutputChainId?: UniverseChainId
  signer: Signer | undefined
  useProviderHook: (chainId: number) => JsonRpcProvider | undefined
  // Used for triggering wallet connection on web
  onConnectWallet?: () => void
  // Used for web to open the token selector from a banner not in the swap flow
  isSwapTokenSelectorOpen: boolean
  setIsSwapTokenSelectorOpen: (open: boolean) => void
}

export const PokiContext = createContext<PokiContext | null>(null)

export function PokiProvider({
  children,
  account,
  connector,
  navigateToBuyOrReceiveWithEmptyWallet,
  navigateToFiatOnRamp,
  navigateToSwapFlow,
  onSwapChainsChanged,
  signer,
  useProviderHook,
  onConnectWallet,
}: PropsWithChildren<
  Omit<PokiContext, 'isSwapTokenSelectorOpen' | 'setIsSwapTokenSelectorOpen' | 'setSwapOutputChainId'>
>): JSX.Element {
  const [swapInputChainId, setSwapInputChainId] = useState<UniverseChainId>()
  const [swapOutputChainId, setSwapOutputChainId] = useState<UniverseChainId>()
  const [isSwapTokenSelectorOpen, setIsSwapTokenSelectorOpen] = useState<boolean>(false)

  const value: PokiContext = useMemo(
    () => ({
      account,
      connector,
      navigateToBuyOrReceiveWithEmptyWallet,
      navigateToFiatOnRamp,
      navigateToSwapFlow,
      onSwapChainsChanged: ({
        chainId,
        prevChainId,
        outputChainId,
      }: {
        chainId: UniverseChainId
        prevChainId?: UniverseChainId
        outputChainId?: UniverseChainId
      }): void => {
        onSwapChainsChanged({ chainId, prevChainId, outputChainId })
        setSwapInputChainId(chainId)
        setSwapOutputChainId(outputChainId)
      },
      signer,
      useProviderHook,
      onConnectWallet,
      swapInputChainId,
      swapOutputChainId,
      setSwapOutputChainId,
      isSwapTokenSelectorOpen,
      setIsSwapTokenSelectorOpen: (open: boolean) => setIsSwapTokenSelectorOpen(open),
    }),
    [
      account,
      connector,
      navigateToBuyOrReceiveWithEmptyWallet,
      navigateToFiatOnRamp,
      navigateToSwapFlow,
      signer,
      useProviderHook,
      onConnectWallet,
      swapInputChainId,
      swapOutputChainId,
      onSwapChainsChanged,
      isSwapTokenSelectorOpen,
      setIsSwapTokenSelectorOpen,
    ],
  )

  return <PokiContext.Provider value={value}>{children}</PokiContext.Provider>
}

/** Cross-platform util for getting items/utils that exist on all apps. */
export function usePokiContext(): PokiContext {
  const context = useContext(PokiContext)
  if (!context) {
    throw new Error('usePokiContext must be used within a PokiProvider')
  }

  return context
}

/** Cross-platform util for getting metadata for the active account/wallet, regardless of platform/environment. */
export function useAccountMeta(): AccountMeta | undefined {
  return usePokiContext().account
}

/** Cross-platform util for getting connector for the active account/wallet, only applicable to web, other platforms are undefined. */
export function useConnector(): Connector | undefined {
  return usePokiContext().connector
}

/** Cross-platform util for getting an RPC provider for the given `chainId`, regardless of platform/environment. */
export function useProvider(chainId: number): JsonRpcProvider | undefined {
  return usePokiContext().useProviderHook(chainId)
}

/** Cross-platform util for getting a signer for the active account/wallet, regardless of platform/environment. */
export function useSigner(): Signer | undefined {
  return usePokiContext().signer
}
