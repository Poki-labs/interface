import { TransactionSettingKey, TransactionSettingsState } from 'poki/src/features/transactions/settings/slice'
import { PokiState } from 'poki/src/state/pokiReducer'

export function selectTransactionSettings(key: TransactionSettingKey): (state: PokiState) => TransactionSettingsState {
  return (state) => state.transactionSettings[key]
}
