import { createSelector, Selector } from '@reduxjs/toolkit'
import { SearchableRecipient } from 'poki/src/features/address/types'
import { uniqueAddressesOnly } from 'poki/src/features/address/utils'
import { UniverseChainId } from 'poki/src/features/chains/types'
import { TransactionsState } from 'poki/src/features/transactions/slice'
import { isBridge, isClassic, isPokiX } from 'poki/src/features/transactions/swap/utils/routing'
import {
  isFinalizedTx,
  PokiXOrderDetails,
  SendTokenTransactionInfo,
  TransactionDetails,
  TransactionType,
} from 'poki/src/features/transactions/types/transactionDetails'
import { selectTokensVisibility } from 'poki/src/features/visibility/selectors'
import { CurrencyIdToVisibility } from 'poki/src/features/visibility/slice'
import { PokiState } from 'poki/src/state/pokiReducer'
import { buildCurrencyId } from 'poki/src/utils/currencyId'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { unique } from 'utilities/src/primitives/array'
import { flattenObjectOfObjects } from 'utilities/src/primitives/objects'

export const selectTransactions = (state: PokiState): TransactionsState => state.transactions

export const selectSwapTransactionsCount = createSelector(selectTransactions, (transactions) => {
  let swapTransactionCount = 0
  const txs = flattenObjectOfObjects(transactions)
  for (const tx of txs) {
    for (const transaction of Object.values(tx)) {
      if (transaction.typeInfo.type === TransactionType.Swap) {
        swapTransactionCount++
      }
    }
  }
  return swapTransactionCount
})

export const makeSelectAddressTransactions = (): Selector<
  PokiState,
  TransactionDetails[] | undefined,
  [Address | null]
> =>
  createSelector(
    selectTransactions,
    (_: PokiState, address: Address | null) => address,
    (transactions, address) => {
      if (!address) {
        return undefined
      }

      const addressTransactions = transactions[address]
      if (!addressTransactions) {
        return undefined
      }

      return unique(flattenObjectOfObjects(addressTransactions), (tx, _, self) => {
        // Remove dummy local FOR transactions from TransactionList, notification badge, etc.
        // this is what prevents the local transactions from actually appearing in the activity tab.
        if (tx.typeInfo.type === TransactionType.LocalOnRamp || tx.typeInfo.type === TransactionType.LocalOffRamp) {
          return false
        }
        /*
         * Remove duplicate transactions with the same chain and nonce, keep the one with the higher addedTime,
         * this represents a txn that is replacing or cancelling the older txn.
         */
        const duplicate = self.find(
          (tx2) =>
            tx2.id !== tx.id &&
            (isClassic(tx) || isBridge(tx)) &&
            (isClassic(tx2) || isBridge(tx2)) &&
            tx2.options.request.chainId &&
            tx2.options.request.chainId === tx.options.request.chainId &&
            tx.options.request.nonce &&
            tx2.options.request.nonce === tx.options.request.nonce,
        )
        if (duplicate) {
          return tx.addedTime > duplicate.addedTime
        }
        return true
      })
    },
  )

export function useSelectAddressTransactions(address: Address | null): TransactionDetails[] | undefined {
  const selectAddressTransactions = useMemo(makeSelectAddressTransactions, [])
  return useSelector((state: PokiState) => selectAddressTransactions(state, address))
}

export function useCurrencyIdToVisibility(addresses: Address[]): CurrencyIdToVisibility {
  const manuallySetTokenVisibility = useSelector(selectTokensVisibility)
  const selectLocalTxCurrencyIds: (state: PokiState, addresses: Address[]) => CurrencyIdToVisibility = useMemo(
    makeSelectTokenVisibilityFromLocalTxs,
    [],
  )

  const tokenVisibilityFromLocalTxs = useSelector((state: PokiState) => selectLocalTxCurrencyIds(state, addresses))

  return useMemo(
    () => ({
      ...tokenVisibilityFromLocalTxs,
      // Tokens the user has individually shown/hidden in the app should take preference over local txs
      ...manuallySetTokenVisibility,
    }),
    [manuallySetTokenVisibility, tokenVisibilityFromLocalTxs],
  )
}

const makeSelectTokenVisibilityFromLocalTxs = (): Selector<PokiState, CurrencyIdToVisibility, [Address[]]> =>
  createSelector(
    selectTransactions,
    (_: PokiState, addresses: Address[]) => addresses,
    (transactions, addresses) =>
      addresses.reduce<CurrencyIdToVisibility>((acc, address) => {
        const addressTransactions = transactions[address]
        if (!addressTransactions) {
          return acc
        }

        Object.values(flattenObjectOfObjects(addressTransactions)).forEach((tx) => {
          if (tx.typeInfo.type === TransactionType.Send) {
            acc[buildCurrencyId(tx.chainId, tx.typeInfo.tokenAddress.toLowerCase())] = {
              isVisible: true,
            }
          } else if (tx.typeInfo.type === TransactionType.Swap) {
            acc[tx.typeInfo.inputCurrencyId.toLowerCase()] = { isVisible: true }
            acc[tx.typeInfo.outputCurrencyId.toLowerCase()] = { isVisible: true }
          }
        })

        return acc
      }, {}),
  )

interface MakeSelectParams {
  address: Address | undefined
  chainId: UniverseChainId | undefined
  txId: string | undefined
}

export const makeSelectTransaction = (): Selector<PokiState, TransactionDetails | undefined, [MakeSelectParams]> =>
  createSelector(
    selectTransactions,
    (_: PokiState, { address, chainId, txId }: MakeSelectParams) => ({
      address,
      chainId,
      txId,
    }),
    (transactions, { address, chainId, txId }): TransactionDetails | undefined => {
      if (!address || !transactions[address] || !chainId || !txId) {
        return undefined
      }

      const addressTxs = transactions[address]?.[chainId]
      if (!addressTxs) {
        return undefined
      }

      return Object.values(addressTxs).find((txDetails) => txDetails.id === txId)
    },
  )

interface MakeSelectOrderParams {
  orderHash: string
}

export const makeSelectPokiXOrder = (): Selector<PokiState, PokiXOrderDetails | undefined, [MakeSelectOrderParams]> =>
  createSelector(
    selectTransactions,
    (_: PokiState, { orderHash }: MakeSelectOrderParams) => ({ orderHash }),
    (transactions, { orderHash }): PokiXOrderDetails | undefined => {
      for (const transactionsForChain of flattenObjectOfObjects(transactions)) {
        for (const tx of Object.values(transactionsForChain)) {
          if (isPokiX(tx) && tx.orderHash === orderHash) {
            return tx
          }
        }
      }
      return undefined
    },
  )
// Returns a list of past recipients ordered from most to least recent
// TODO: [MOB-232] either revert this to return addresses or keep but also return displayName so that it's searchable for RecipientSelect
export const selectRecipientsByRecency = (state: PokiState): SearchableRecipient[] => {
  const transactionsByChainId = flattenObjectOfObjects(state.transactions)
  const sendTransactions = transactionsByChainId.reduce<TransactionDetails[]>((accum, transactions) => {
    const sendTransactionsWithRecipients = Object.values(transactions).filter(
      (tx) => tx.typeInfo.type === TransactionType.Send && tx.typeInfo.recipient,
    )
    return [...accum, ...sendTransactionsWithRecipients]
  }, [])
  const sortedRecipients = sendTransactions
    .sort((a, b) => (a.addedTime < b.addedTime ? 1 : -1))
    .map((transaction) => {
      return {
        address: (transaction.typeInfo as SendTokenTransactionInfo)?.recipient,
        name: '',
      } as SearchableRecipient
    })
  return uniqueAddressesOnly(sortedRecipients)
}

export const selectIncompleteTransactions = (state: PokiState): TransactionDetails[] => {
  const transactionsByChainId = flattenObjectOfObjects(state.transactions)
  return transactionsByChainId.reduce<TransactionDetails[]>((accum, transactions) => {
    const pendingTxs = Object.values(transactions).filter((tx) => Boolean(!tx.receipt) && !isFinalizedTx(tx))
    return [...accum, ...pendingTxs]
  }, [])
}
