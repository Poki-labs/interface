import { AccountType } from 'poki/src/features/accounts/types'

export interface SearchableRecipient {
  address: Address
  name?: string | null
  isUnitag?: boolean
  type?: AccountType
}
