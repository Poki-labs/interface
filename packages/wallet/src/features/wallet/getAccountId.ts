import { AddressStringFormat, normalizeAddress } from 'poki/src/utils/addresses'

export function getAccountId(address: Address): string {
  return normalizeAddress(address, AddressStringFormat.Lowercase)
}
