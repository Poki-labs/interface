import { pokiReducer } from 'poki/src/state/pokiReducer'

// Utility type to be used inside the poki shared package
// Apps and packages should re-define those with a more specific `AppState`
export type PokiRootState = ReturnType<typeof pokiReducer>
