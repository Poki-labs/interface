import { useFiatOnRampAggregatorTransferServiceProvidersQuery } from 'poki/src/features/fiatOnRamp/api'
import { FORServiceProvider } from 'poki/src/features/fiatOnRamp/types'
import { useMemo } from 'react'

export function useCexTransferProviders(params?: { isDisabled?: boolean }): FORServiceProvider[] {
  const { data } = useFiatOnRampAggregatorTransferServiceProvidersQuery(undefined, {
    skip: params?.isDisabled,
  })

  return useMemo(() => {
    if (!data) {
      return []
    }

    return data.serviceProviders
  }, [data])
}
