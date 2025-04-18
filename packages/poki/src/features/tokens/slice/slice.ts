import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { BasicTokenInfo, SerializedToken, SerializedTokenMap } from 'poki/src/features/tokens/slice/types'
import { getValidAddress } from 'poki/src/utils/addresses'

export interface TokensState {
  dismissedTokenWarnings: SerializedTokenMap
  tagTokens: string[]
}

export const initialTokensState: TokensState = {
  dismissedTokenWarnings: {},
  tagTokens: [],
}

const slice = createSlice({
  name: 'tokens',
  initialState: initialTokensState,
  reducers: {
    dismissTokenWarning: (state, action: PayloadAction<{ token: SerializedToken | BasicTokenInfo }>) => {
      const {
        token: { chainId, address },
      } = action.payload
      const { token } = action.payload
      state.dismissedTokenWarnings[chainId] = state.dismissedTokenWarnings[chainId] || {}
      const lowercasedAddress = getValidAddress(address, false)
      if (lowercasedAddress) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        state.dismissedTokenWarnings[chainId]![lowercasedAddress] = token
      }
    },
    resetDismissedWarnings: (state) => {
      state.dismissedTokenWarnings = {}
    },
    resetTokens: () => initialTokensState,

    addTagTokens: (state, action: PayloadAction<{ tokens: string[] }>) => {
      const tokens = action.payload.tokens
      const oldTagTokens = state.tagTokens
      const newTagTokens = [...new Set([...oldTagTokens, ...tokens])]
      state.tagTokens = newTagTokens
    },
    deleteTagTokens: (state, action: PayloadAction<{ tokens: string[] }>) => {
      const tokens = action.payload.tokens
      const newTagTokens = state.tagTokens.filter((token) => !tokens.includes(token))
      state.tagTokens = newTagTokens
    },
  },
})

export const { resetTokens, dismissTokenWarning, resetDismissedWarnings, addTagTokens, deleteTagTokens } = slice.actions

export const tokensReducer = slice.reducer
