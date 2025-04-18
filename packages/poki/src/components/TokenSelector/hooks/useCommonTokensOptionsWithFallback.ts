import { useCommonTokensOptions } from 'poki/src/components/TokenSelector/hooks/useCommonTokensOptions'
import { currencyInfosToTokenOptions } from 'poki/src/components/TokenSelector/hooks/useCurrencyInfosToTokenOptions'
import { TokenOption } from 'poki/src/components/TokenSelector/types'
import { COMMON_BASES } from 'poki/src/constants/routing'
import { GqlResult } from 'poki/src/data/types'
import { UniverseChainId } from 'poki/src/features/chains/types'

export function useCommonTokensOptionsWithFallback(
  address: Address | undefined,
  chainFilter: UniverseChainId | null,
): GqlResult<TokenOption[] | undefined> {
  const { data, error, refetch, loading } = useCommonTokensOptions(address, chainFilter)
  const commonBases = chainFilter ? currencyInfosToTokenOptions(COMMON_BASES[chainFilter]) : undefined

  const shouldFallback = data?.length === 0 && commonBases?.length

  return {
    data: shouldFallback ? commonBases : data,
    error: shouldFallback ? undefined : error,
    refetch,
    loading,
  }
}
