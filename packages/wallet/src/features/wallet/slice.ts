import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RankingType } from 'poki/src/data/types'
import { areAddressesEqual } from 'poki/src/utils/addresses'
import { logger } from 'utilities/src/logger/logger'
import { Account } from 'wallet/src/features/wallet/accounts/types'
import { ExploreOrderBy } from 'wallet/src/features/wallet/types'
import { isValidPrincipal } from 'wallet/src/utils/isValidPrincipal'

export enum SwapProtectionSetting {
  On = 'on',
  Off = 'off',
}

export interface WalletSliceState {
  accounts: Record<Address, Account>
  activeAccountAddress: Address | null
  finishedOnboarding?: boolean
  // Persisted UI configs set by the user through interaction with filters and settings
  settings: {
    swapProtection: SwapProtectionSetting
    tokensOrderBy?: ExploreOrderBy
  }

  // Tracks app rating
  appRatingPromptedMs?: number // last time user as prompted to provide rating/feedback
  appRatingProvidedMs?: number // last time user provided rating (through native modal)
  appRatingFeedbackProvidedMs?: number // last time user provided feedback (form)
}

export const initialWalletState: WalletSliceState = {
  accounts: {},
  activeAccountAddress: null,
  settings: {
    swapProtection: SwapProtectionSetting.On,
    tokensOrderBy: RankingType.Volume,
  },
}

const slice = createSlice({
  name: 'wallet',
  initialState: initialWalletState,
  reducers: {
    addAccount: (state, action: PayloadAction<Account>) => {
      const { address } = action.payload

      if (!isValidPrincipal(address)) {
        throw new Error(`Cannot add an account with an invalid address ${address}`)
      }

      state.accounts[address] = action.payload
    },
    addAccounts: (state, action: PayloadAction<Account[]>) => {
      const accounts = action.payload
      accounts.forEach((account) => {
        if (!isValidPrincipal(account.address)) {
          throw new Error(`Cannot add an account with an invalid address ${account.address}`)
        }
        state.accounts[account.address] = account
      })
    },
    removeAccounts: (state, action: PayloadAction<Address[]>) => {
      const addressesToRemove = action.payload
      addressesToRemove.forEach((address) => {
        if (!isValidPrincipal(address)) {
          throw new Error('Cannot remove an account with an invalid address')
        }
        if (!state.accounts[address]) {
          throw new Error(`Cannot remove missing account ${address}`)
        }
        delete state.accounts[address]
      })

      // Reset active account to first account if currently active account is deleted
      if (
        state.activeAccountAddress &&
        addressesToRemove.some((addressToRemove) => areAddressesEqual(addressToRemove, state.activeAccountAddress))
      ) {
        const firstAccountId = Object.keys(state.accounts)[0]
        state.activeAccountAddress = firstAccountId ?? null
      }
    },
    editAccount: (state, action: PayloadAction<{ address: Address; updatedAccount: Account }>) => {
      const { address, updatedAccount } = action.payload

      if (!isValidPrincipal(address)) {
        throw new Error('Cannot edit an account with an invalid address')
      }
      if (!state.accounts[address]) {
        throw new Error(`Cannot edit missing account ${address}`)
      }
      state.accounts[address] = updatedAccount
    },
    setAccountAsActive: (state, action: PayloadAction<Address>) => {
      const address = action.payload

      if (!isValidPrincipal(address)) {
        throw new Error('Cannot activate an account with an invalid address')
      }
      if (!state.accounts[address]) {
        throw new Error(`Cannot activate missing account ${address}`)
      }
      state.activeAccountAddress = address
    },
    setFinishedOnboarding: (
      state,
      { payload: { finishedOnboarding } }: PayloadAction<{ finishedOnboarding: boolean }>,
    ) => {
      state.finishedOnboarding = finishedOnboarding
    },
    setTokensOrderBy: (
      state,
      { payload: { newTokensOrderBy } }: PayloadAction<{ newTokensOrderBy: ExploreOrderBy }>,
    ) => {
      state.settings.tokensOrderBy = newTokensOrderBy
    },
    setSwapProtectionSetting: (
      state,
      { payload: { newSwapProtectionSetting } }: PayloadAction<{ newSwapProtectionSetting: SwapProtectionSetting }>,
    ) => {
      state.settings.swapProtection = newSwapProtectionSetting
    },
    setAppRating: (
      state,
      {
        payload: { ratingProvided, feedbackProvided },
      }: PayloadAction<{ ratingProvided?: boolean; feedbackProvided?: boolean }>,
    ) => {
      state.appRatingPromptedMs = Date.now()

      if (ratingProvided) {
        state.appRatingProvidedMs = Date.now()
      }
      if (feedbackProvided) {
        state.appRatingFeedbackProvidedMs = Date.now()
      }
    },
    resetWallet: () => initialWalletState,
    restoreMnemonicComplete: (state) => state,
    setHasBalanceOrActivity: (state, action: PayloadAction<{ address: Address; hasBalanceOrActivity?: boolean }>) => {
      const { address, hasBalanceOrActivity } = action.payload

      if (!isValidPrincipal(address)) {
        logger.error('Unexpected call to `setHasBalanceOrActivity` with invalid `address`', {
          extra: { payload: action.payload },
          tags: { file: 'wallet/slice.ts', function: 'setHasBalanceOrActivity' },
        })
        return
      }
      const account = state.accounts[address]
      if (account) {
        account.hasBalanceOrActivity = hasBalanceOrActivity
      }
    },
  },
})

export const {
  addAccount,
  addAccounts,
  removeAccounts,
  editAccount,
  setAccountAsActive,
  resetWallet,
  setFinishedOnboarding,
  setTokensOrderBy,
  restoreMnemonicComplete,
  setSwapProtectionSetting,
  setAppRating,
  setHasBalanceOrActivity,
} = slice.actions

export const walletReducer = slice.reducer
