import { Language } from 'poki/src/features/language/constants'
import { PokiState } from 'poki/src/state/pokiReducer'

export const selectWalletHideSmallBalancesSetting = (state: PokiState): boolean => state.userSettings.hideSmallBalances

export const selectWalletHideSpamTokensSetting = (state: PokiState): boolean => state.userSettings.hideSpamTokens

export const selectCurrentLanguage = (state: PokiState): Language => state.userSettings.currentLanguage

export const selectIsTestnetModeEnabled = (state: PokiState): boolean =>
  state.userSettings.isTestnetModeEnabled ?? false
