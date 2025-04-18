import { ALL_CHAIN_IDS, UniverseChainId } from 'poki/src/features/chains/types'
import { ChainsConfigKey, DynamicConfigs } from 'poki/src/features/gating/configs'
import { useDynamicConfigValue } from 'poki/src/features/gating/hooks'
import { useMemo } from 'react'

// Returns the given chains ordered based on the statsig config
export function useOrderedChainIds(chainIds: UniverseChainId[]): UniverseChainId[] {
  const serverOrderedChains = useDynamicConfigValue(
    DynamicConfigs.Chains,
    ChainsConfigKey.OrderedChainIds,
    ALL_CHAIN_IDS,
  )

  return useMemo(() => {
    const orderedChains = serverOrderedChains.filter((c) => chainIds.includes(c))
    const unspecifiedChains = chainIds.filter((c) => !serverOrderedChains.includes(c))
    return [...orderedChains, ...unspecifiedChains]
  }, [serverOrderedChains, chainIds])
}
