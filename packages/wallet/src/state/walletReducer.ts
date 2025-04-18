import { timingReducer } from 'poki/src/features/timing/slice'
import { pokiPersistedStateList, pokiReducers } from 'poki/src/state/pokiReducer'
import { combineReducers } from 'redux'
import { PersistState } from 'redux-persist'
import { appearanceSettingsReducer } from 'wallet/src/features/appearance/slice'
import { behaviorHistoryReducer } from 'wallet/src/features/behaviorHistory/slice'
import { telemetryReducer } from 'wallet/src/features/telemetry/slice'
import { walletReducer } from 'wallet/src/features/wallet/slice'
import { SagaState } from 'wallet/src/utils/saga'

export const walletReducers = {
  ...pokiReducers,
  appearanceSettings: appearanceSettingsReducer,
  behaviorHistory: behaviorHistoryReducer,
  telemetry: telemetryReducer,
  timing: timingReducer,
  wallet: walletReducer,
} as const

// used to type RootState
export const walletRootReducer = combineReducers(walletReducers)

export const walletPersistedStateList: Array<keyof typeof walletReducers> = [
  ...pokiPersistedStateList,
  'appearanceSettings',
  'behaviorHistory',
  'notifications',
  'telemetry',
  'wallet',
]

export type WalletStateReducersOnly = ReturnType<typeof walletRootReducer>
export type WalletState = WalletStateReducersOnly & {
  saga: Record<string, SagaState>
} & { _persist?: PersistState }
