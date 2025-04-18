/* eslint-disable max-lines */
import { NetworkStatus, Reference, useApolloClient, WatchQueryFetchPolicy } from '@apollo/client'
import isEqual from 'lodash/isEqual'
import { PollingInterval } from 'poki/src/constants/misc'
import {
  ContractInput,
  IAmount,
  PortfolioValueModifier,
} from 'poki/src/data/graphql/poki-data-api/__generated__/types-and-hooks'
import { GqlResult, SpamCode } from 'poki/src/data/types'
import { useEnabledChains } from 'poki/src/features/chains/hooks/useEnabledChains'
import { PortfolioBalance } from 'poki/src/features/dataApi/types'
import { currencyIdToContractInput, sortByName } from 'poki/src/features/dataApi/utils'
import { useHideSmallBalancesSetting, useHideSpamTokensSetting } from 'poki/src/features/settings/hooks'
import { useCurrencyIdToVisibility } from 'poki/src/features/transactions/selectors'
import { CurrencyId } from 'poki/src/types/currency'
import { useCallback, useMemo } from 'react'
import { logger } from 'utilities/src/logger/logger'

export type SortedPortfolioBalances = {
  balances: PortfolioBalance[]
  hiddenBalances: PortfolioBalance[]
}

export type PortfolioTotalValue = {
  balanceUSD: number | undefined
  percentChange: number | undefined
  absoluteChangeUSD: number | undefined
}

export type PortfolioCacheUpdater = (hidden: boolean, portfolioBalance?: PortfolioBalance) => void

/**
 * Returns all balances indexed by checksummed currencyId for a given address
 * @param address
 * @param queryOptions.pollInterval optional `PollingInterval` representing polling frequency.
 *  If undefined, will query once and not poll.
 * NOTE:
 *  on TokenDetails, useBalances relies rely on usePortfolioBalances but don't need polling versions of it.
 *  Including polling was causing multiple polling intervals to be kicked off with usePortfolioBalances.
 *  Same with on Token Selector's TokenSearchResultList, since the home screen has a usePortfolioBalances polling hook,
 *  we don't need to duplicate the polling interval when token selector is open
 * @param queryOptions - QueryHookOptions type for usePortfolioBalancesQuery to be set if not already set internally.
 */
export function usePortfolioBalances({
  address,
}: {
  address?: Address
}): GqlResult<Record<CurrencyId, PortfolioBalance>> & { networkStatus: NetworkStatus } {
  const retry = useCallback(() => {
    console.log('retry')
  }, [])

  return {
    data: undefined,
    loading: false,
    networkStatus: NetworkStatus.ready,
    refetch: retry,
    error: undefined,
  }
}

const PORTFOLIO_BALANCE_CACHE = new Map<string, PortfolioBalance>()

function buildPortfolioBalance(args: PortfolioBalance): PortfolioBalance {
  const cachedPortfolioBalance = PORTFOLIO_BALANCE_CACHE.get(args.cacheId)

  if (cachedPortfolioBalance && isEqual(cachedPortfolioBalance, args)) {
    // This allows us to better memoize components that use a `portfolioBalance` as a dependency.
    return cachedPortfolioBalance
  }

  PORTFOLIO_BALANCE_CACHE.set(args.cacheId, args)
  return args
}

export function usePortfolioTotalValue({
  address,
  pollInterval,
  onCompleted,
  fetchPolicy,
}: {
  address?: Address
  pollInterval?: PollingInterval
  onCompleted?: () => void
  fetchPolicy?: WatchQueryFetchPolicy
}): GqlResult<PortfolioTotalValue> & { networkStatus: NetworkStatus } {
  const retry = useCallback(() => {
    console.log('retry')
  }, [])

  return {
    data: undefined,
    loading: false,
    networkStatus: NetworkStatus.error,
    refetch: retry,
    error: undefined,
  }
}

interface TokenOverrides {
  tokenIncludeOverrides: ContractInput[]
  tokenExcludeOverrides: ContractInput[]
}

export function usePortfolioValueModifiers(addresses?: Address | Address[]): PortfolioValueModifier[] | undefined {
  // Memoize array creation if passed a string to avoid recomputing at every render
  const addressArray = useMemo(
    () => (!addresses ? [] : Array.isArray(addresses) ? addresses : [addresses]),
    [addresses],
  )
  const currencyIdToTokenVisibility = useCurrencyIdToVisibility(addressArray)

  const hideSpamTokens = useHideSpamTokensSetting()
  const hideSmallBalances = useHideSmallBalancesSetting()

  const modifiers = useMemo<PortfolioValueModifier[]>(() => {
    const { tokenIncludeOverrides, tokenExcludeOverrides } = Object.entries(currencyIdToTokenVisibility).reduce(
      (acc: TokenOverrides, [key, tokenVisibility]) => {
        const contractInput = currencyIdToContractInput(key)
        if (tokenVisibility.isVisible) {
          acc.tokenIncludeOverrides.push(contractInput)
        } else {
          acc.tokenExcludeOverrides.push(contractInput)
        }
        return acc
      },
      {
        tokenIncludeOverrides: [],
        tokenExcludeOverrides: [],
      },
    )

    return addressArray.map((addr) => ({
      ownerAddress: addr,
      tokenIncludeOverrides,
      tokenExcludeOverrides,
      includeSmallBalances: !hideSmallBalances,
      includeSpamTokens: !hideSpamTokens,
    }))
  }, [addressArray, currencyIdToTokenVisibility, hideSmallBalances, hideSpamTokens])

  return modifiers.length > 0 ? modifiers : undefined
}

/**
 * Returns NativeCurrency with highest balance.
 *
 * @param address to get portfolio balances for
 * @returns CurrencyId of the NativeCurrency with highest balance
 *
 */
export function useHighestBalanceNativeCurrencyId(address: Address): CurrencyId | undefined {
  // const { data } = useSortedPortfolioBalances({ address })
  // return data?.balances.find((balance) => balance.currencyInfo.currency.isNative)?.currencyInfo.currencyId
  return undefined
}

/**
 * Custom hook to group Token Balances fetched from API to shown and hidden.
 *
 * @param balancesById - An object where keys are token ids and values are the corresponding balances. May be undefined.
 *
 * @returns {object} An object containing two fields:
 *  - `shownTokens`: shown tokens.
 *  - `hiddenTokens`: hidden tokens.
 *
 * @example
 * const { shownTokens, hiddenTokens } = useTokenBalancesGroupedByVisibility({ balancesById });
 */
export function useTokenBalancesGroupedByVisibility({
  balancesById,
}: {
  balancesById?: Record<string, PortfolioBalance>
}): {
  shownTokens: PortfolioBalance[] | undefined
  hiddenTokens: PortfolioBalance[] | undefined
} {
  const { isTestnetModeEnabled } = useEnabledChains()

  return useMemo(() => {
    if (!balancesById) {
      return { shownTokens: undefined, hiddenTokens: undefined }
    }

    const { shown, hidden } = Object.values(balancesById).reduce<{
      shown: PortfolioBalance[]
      hidden: PortfolioBalance[]
    }>(
      (acc, balance) => {
        const isTokenHidden = isTestnetModeEnabled
          ? (balance.currencyInfo.spamCode || SpamCode.LOW) >= SpamCode.HIGH
          : balance.isHidden

        if (isTokenHidden) {
          acc.hidden.push(balance)
        } else {
          acc.shown.push(balance)
        }
        return acc
      },
      { shown: [], hidden: [] },
    )
    return {
      shownTokens: shown.length ? shown : undefined,
      hiddenTokens: hidden.length ? hidden : undefined,
    }
  }, [balancesById, isTestnetModeEnabled])
}

/**
 * Returns portfolio balances for a given address sorted by USD value.
 *
 * @param address to get portfolio balances for
 * @param pollInterval optional polling interval for auto refresh.
 *    If undefined, query will run only once.
 * @param onCompleted callback
 * @returns SortedPortfolioBalances object with `balances` and `hiddenBalances`
 */
export function useSortedPortfolioBalances({
  address,
  pollInterval,
  onCompleted,
}: {
  address?: Address
  pollInterval?: PollingInterval
  onCompleted?: () => void
}): GqlResult<SortedPortfolioBalances> & { networkStatus: NetworkStatus } {
  return {
    data: undefined,
    loading: false,
    networkStatus: NetworkStatus.error,
    refetch: () => {},
  }
}

/**
 * Helper function to stable sort balances by descending balanceUSD – or native balance tokens in testnet mode –
 * followed by all other tokens sorted alphabetically
 * */
export function sortPortfolioBalances({
  balances,
  isTestnetModeEnabled,
}: {
  balances: PortfolioBalance[]
  isTestnetModeEnabled: boolean
}): PortfolioBalance[] {
  if (isTestnetModeEnabled) {
    const sortedNativeBalances = balances
      .filter((b) => b.currencyInfo.currency.isNative)
      .sort((a, b) => b.quantity - a.quantity)

    const sortedNonNativeBalances = sortByName(balances.filter((b) => !b.currencyInfo.currency.isNative))

    return [...sortedNativeBalances, ...sortedNonNativeBalances]
  }

  const balancesWithUSDValue = balances.filter((b) => b.balanceUSD)
  const balancesWithoutUSDValue = balances.filter((b) => !b.balanceUSD)

  return [
    ...balancesWithUSDValue.sort((a, b) => {
      if (!a.balanceUSD) {
        return 1
      }
      if (!b.balanceUSD) {
        return -1
      }
      return b.balanceUSD - a.balanceUSD
    }),
    ...sortByName(balancesWithoutUSDValue),
  ]
}

/**
 * Creates a function to update the Apollo cache when a token is shown or hidden.
 * We manually modify the cache to avoid having to wait for the server's response,
 * so that the change is immediately reflected in the UI.
 *
 * @param address active wallet address
 * @returns a `PortfolioCacheUpdater` function that will update the Apollo cache
 */
export function usePortfolioCacheUpdater(address: string): PortfolioCacheUpdater {
  const apolloClient = useApolloClient()
  const { gqlChains } = useEnabledChains()

  const updater = useCallback(
    (hidden: boolean, portfolioBalance?: PortfolioBalance) => {
      if (!portfolioBalance) {
        return
      }

      const cachedPortfolio = apolloClient.readQuery<PortfolioBalancesQuery>({
        query: PortfolioBalancesDocument,
        variables: {
          ownerAddress: address,
          chains: gqlChains,
        },
      })?.portfolios?.[0]

      if (!cachedPortfolio) {
        return
      }

      apolloClient.cache.modify({
        id: portfolioBalance.cacheId,
        fields: {
          isHidden() {
            return hidden
          },
        },
      })

      apolloClient.cache.modify({
        id: apolloClient.cache.identify(cachedPortfolio),
        fields: {
          tokensTotalDenominatedValue(amount: Reference | IAmount, { isReference }) {
            if (isReference(amount)) {
              // I don't think this should ever happen, but this is required to keep TS happy after upgrading to @apollo/client > 3.8.
              logger.error(new Error('Unable to modify cache for `tokensTotalDenominatedValue`'), {
                tags: {
                  file: 'balances.ts',
                  function: 'usePortfolioCacheUpdater',
                },
                extra: {
                  portfolioId: apolloClient.cache.identify(cachedPortfolio),
                },
              })
              return amount
            }

            const newValue = portfolioBalance.balanceUSD
              ? hidden
                ? amount.value - portfolioBalance.balanceUSD
                : amount.value + portfolioBalance.balanceUSD
              : amount.value
            return { ...amount, value: newValue }
          },
        },
      })
    },
    [apolloClient, address, gqlChains],
  )

  return updater
}
