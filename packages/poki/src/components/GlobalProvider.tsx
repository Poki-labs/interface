import BigNumber from 'bignumber.js'
import { PublicTokenOverview } from 'poki/src/candid/info/node_index'
import { CurrencyInfo } from 'poki/src/features/dataApi/types'
import { useAllTokensOfSwap, useTokensFromExplorer } from 'poki/src/features/tokens/useAllTokens'
import { useAllTokensInfo } from 'poki/src/features/tokens/useAllTokensInfo'
import { IcExplorerTokenDetail } from 'poki/src/types/ic-explorer'
import { ReactNode, createContext, useCallback, useContext, useMemo, useState } from 'react'

interface GlobalContextProps {
  tokens: IcExplorerTokenDetail[]
  loadingTokens: boolean
  allSwapTokens: CurrencyInfo[]
  allTokensInfo: PublicTokenOverview[]
  balanceUSD: string | undefined
  balanceUSDBeforeChange: string | undefined
  updateBalanceUSDMap: (tokenId: string, balance: string | undefined) => void
  updateBalanceUSDBeforeChangeMap: (tokenId: string, balance: string | undefined) => void
}

export const GlobalContext = createContext({} as GlobalContextProps)

export function useGlobalContext() {
  return useContext(GlobalContext)
}

interface GlobalProviderProps {
  children: ReactNode
}

export function GlobalProvider({ children }: GlobalProviderProps) {
  const [balanceUSDMap, updateBalanceUSDMap] = useState<{ [key: string]: string }>({})
  const [balanceUSDBeforeChangeMap, updateBalanceUSDBeforeChangeMap] = useState<{ [key: string]: string }>({})

  const { result: allSwapTokens } = useAllTokensOfSwap()
  const { result: allExplorerTokens, loading } = useTokensFromExplorer()
  const { result: allTokensInfo } = useAllTokensInfo()

  const formattedAllSwapTokens: CurrencyInfo[] = useMemo(() => {
    if (!allSwapTokens) return []

    return allSwapTokens.map(
      (e) =>
        ({
          fee: Number(e.fee),
          decimals: Number(e.decimals),
          minting_account: undefined,
          logo: e.logo[0],
          name: e.name,
          ledger_id: e.ledger_id.toString(),
          min_burn_amount: Number(e.min_burn_amount),
          max_supply: e.max_supply[0],
          index: Number(e.index),
          standard: e.standard,
          total_supply: Number(e.total_supply),
          symbol: e.symbol,
        }) as CurrencyInfo,
    )
  }, [allSwapTokens])

  const balanceUSD = useMemo(() => {
    const totalUsd = Object.keys(balanceUSDMap).reduce((prev, curr) => {
      return prev.plus(balanceUSDMap[curr] ?? 0)
    }, new BigNumber(0))

    return totalUsd.toString()
  }, [balanceUSDMap])

  const handleUpdateBalanceUSDMap = useCallback(
    (tokenId: string, usd: string | undefined) => {
      updateBalanceUSDMap((prevState) => ({
        ...prevState,
        [tokenId]: usd ?? '0',
      }))
    },
    [updateBalanceUSDMap],
  )

  const balanceUSDBeforeChange = useMemo(() => {
    const totalUsd = Object.keys(balanceUSDBeforeChangeMap).reduce((prev, curr) => {
      return prev.plus(balanceUSDBeforeChangeMap[curr] ?? 0)
    }, new BigNumber(0))

    return totalUsd.toString()
  }, [balanceUSDBeforeChangeMap])

  const handleUpdateBalanceUSDBeforeChangeMap = useCallback(
    (tokenId: string, usd: string | undefined) => {
      updateBalanceUSDBeforeChangeMap((prevState) => ({
        ...prevState,
        [tokenId]: usd ?? '0',
      }))
    },
    [updateBalanceUSDBeforeChangeMap],
  )

  return (
    <GlobalContext.Provider
      value={{
        loadingTokens: loading,
        tokens: allExplorerTokens ?? [],
        allSwapTokens: formattedAllSwapTokens ?? [],
        allTokensInfo: allTokensInfo ?? [],
        balanceUSD,
        updateBalanceUSDMap: handleUpdateBalanceUSDMap,
        balanceUSDBeforeChange,
        updateBalanceUSDBeforeChangeMap: handleUpdateBalanceUSDBeforeChangeMap,
      }}
    >
      {children}
    </GlobalContext.Provider>
  )
}
