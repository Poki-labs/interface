import { useMemo } from 'react'

export interface AddressWithBalanceAndName {
  address: string
  balance?: number
  unitag?: string
  ensName?: string
}

export function useImportableAccounts(importedAddresses?: Address[]): {
  importableAccounts?: AddressWithBalanceAndName[]
} {
  const importableAccounts = useMemo(() => {
    if (!importedAddresses) return undefined

    return importedAddresses.map((address) => ({ address, balance: undefined, unitag: undefined, ensName: undefined }))
  }, [importedAddresses])

  return {
    importableAccounts,
  }
}
