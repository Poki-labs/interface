import { ethers } from 'ethers'
import { PokiProvider } from 'poki/src/contexts/PokiContext'
import { UniverseChainId } from 'poki/src/features/chains/types'
import { prepareSwapFormState } from 'poki/src/features/transactions/types/transactionState'
import { PropsWithChildren, useCallback, useEffect, useState } from 'react'
import { logger } from 'utilities/src/logger/logger'
import { useWalletNavigation } from 'wallet/src/contexts/WalletNavigationContext'
import { useShowSwapNetworkNotification } from 'wallet/src/features/transactions/swap/hooks/useShowSwapNetworkNotification'
import { useProvider, useWalletSigners } from 'wallet/src/features/wallet/context'
import { useActiveAccount, useActiveSignerAccount } from 'wallet/src/features/wallet/hooks'

// Adapts useProvider to fit poki context requirement of returning undefined instead of null
function useWalletProvider(chainId: number): ethers.providers.JsonRpcProvider | undefined {
  return useProvider(chainId) ?? undefined
}

// Gets the signer for the active account
function useWalletSigner(): ethers.Signer | undefined {
  const account = useActiveSignerAccount()
  const signerManager = useWalletSigners()
  const [signer, setSigner] = useState<ethers.Signer | undefined>(undefined)
  useEffect(() => {
    setSigner(undefined) // clear signer if account changes

    if (!account) {
      return
    }

    signerManager
      .getSignerForAccount(account)
      .then(setSigner)
      .catch((error) => logger.error(error, { tags: { file: 'WalletPokiContext', function: 'useWalletSigner' } }))
  }, [account, signerManager])

  return signer
}

// Abstracts wallet-specific transaction flow objects for usage in cross-platform flows in the `poki` package.
export function WalletPokiProvider({ children }: PropsWithChildren): JSX.Element {
  const account = useActiveAccount() ?? undefined
  const signer = useWalletSigner()
  const { navigateToBuyOrReceiveWithEmptyWallet, navigateToFiatOnRamp, navigateToSwapFlow } = useWalletNavigation()
  const showSwapNetworkNotification = useShowSwapNetworkNotification()

  const navigateToSwapFromCurrencyIds = useCallback(
    ({ inputCurrencyId, outputCurrencyId }: { inputCurrencyId?: string; outputCurrencyId?: string }) => {
      const initialState = prepareSwapFormState({
        inputCurrencyId,
        outputCurrencyId,
        defaultChainId: UniverseChainId.Mainnet,
      })
      navigateToSwapFlow({ initialState })
    },
    [navigateToSwapFlow],
  )

  return (
    <PokiProvider
      account={account}
      navigateToBuyOrReceiveWithEmptyWallet={navigateToBuyOrReceiveWithEmptyWallet}
      navigateToFiatOnRamp={navigateToFiatOnRamp}
      navigateToSwapFlow={navigateToSwapFromCurrencyIds}
      signer={signer}
      useProviderHook={useWalletProvider}
      onSwapChainsChanged={showSwapNetworkNotification}
    >
      {children}
    </PokiProvider>
  )
}
