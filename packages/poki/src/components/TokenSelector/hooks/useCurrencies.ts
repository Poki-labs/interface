import { ApolloError } from '@apollo/client'
import { BRIDGED_BASE_ADDRESSES } from 'poki/src/constants/addresses'
import { GqlResult } from 'poki/src/data/types'
import { useTokenProjects } from 'poki/src/features/dataApi/tokenProjects'
import { CurrencyInfo } from 'poki/src/features/dataApi/types'
import { usePersistedError } from 'poki/src/features/dataApi/utils'
import { areAddressesEqual } from 'poki/src/utils/addresses'
import { useMemo } from 'react'

export function useCurrencies(currencyIds: string[]): GqlResult<CurrencyInfo[]> {
  const { data: baseCurrencyInfos, loading, error, refetch } = useTokenProjects(currencyIds)
  const persistedError = usePersistedError(loading, error instanceof ApolloError ? error : undefined)

  // TokenProjects returns tokens on every network, so filter out native assets that have a
  // bridged version on other networks
  const filteredBaseCurrencyInfos = useMemo(() => {
    return baseCurrencyInfos?.filter((currencyInfo) => {
      if (currencyInfo.currency.isNative) {
        return true
      }

      const { address } = currencyInfo.currency
      const bridgedAsset = BRIDGED_BASE_ADDRESSES.find((bridgedAddress) => areAddressesEqual(bridgedAddress, address))

      if (!bridgedAsset) {
        return true
      }

      return false
    })
  }, [baseCurrencyInfos])

  return { data: filteredBaseCurrencyInfos, loading, error: persistedError, refetch }
}
