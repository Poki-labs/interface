import { useAccountMeta } from 'poki/src/contexts/PokiContext'
import { FeatureFlags } from 'poki/src/features/gating/flags'
import { useFeatureFlag } from 'poki/src/features/gating/hooks'
import { useSwapFormContext } from 'poki/src/features/transactions/swap/contexts/SwapFormContext'
import { useSwapTxAndGasInfo } from 'poki/src/features/transactions/swap/hooks/useSwapTxAndGasInfo'
import { SwapTxAndGasInfo } from 'poki/src/features/transactions/swap/types/swapTxAndGasInfo'
import { PropsWithChildren, createContext, useContext, useEffect } from 'react'
import { logContextUpdate } from 'utilities/src/logger/contextEnhancer'

export const SwapTxContext = createContext<SwapTxAndGasInfo | undefined>(undefined)

export function SwapTxContextProviderTradingApi({ children }: PropsWithChildren): JSX.Element {
  const account = useAccountMeta()
  const { derivedSwapInfo } = useSwapFormContext()
  const swapTxContext = useSwapTxAndGasInfo({ derivedSwapInfo, account })
  const datadogEnabled = useFeatureFlag(FeatureFlags.Datadog)

  useEffect(() => {
    logContextUpdate('SwapTxContext', swapTxContext, datadogEnabled)
  }, [swapTxContext, datadogEnabled])

  return <SwapTxContext.Provider value={swapTxContext}>{children}</SwapTxContext.Provider>
}

export const useSwapTxContext = (): SwapTxAndGasInfo => {
  const swapContext = useContext(SwapTxContext)

  if (swapContext === undefined) {
    throw new Error('`useSwapTxContext` must be used inside of `SwapTxContextProvider`')
  }

  return swapContext
}
