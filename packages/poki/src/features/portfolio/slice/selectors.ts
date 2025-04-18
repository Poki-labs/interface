import { Selector, createSelector } from '@reduxjs/toolkit'
import { PortfolioState, TokenBalanceOverride } from 'poki/src/features/portfolio/slice/slice'
import { PokiState } from 'poki/src/state/pokiReducer'

export const selectTokenBalanceOverrides = (state: PokiState): PortfolioState['tokenBalanceOverrides'] =>
  state.portfolio.tokenBalanceOverrides

export const makeSelectTokenBalanceOverridesForWalletAddress = (): Selector<
  PokiState,
  undefined | TokenBalanceOverride,
  [Address]
> =>
  createSelector(
    selectTokenBalanceOverrides,
    (_: PokiState, walletAddress: Address) => walletAddress,
    (tokenBalanceOverrides, walletAddress) => tokenBalanceOverrides[walletAddress.toLowerCase()],
  )
