import { UniverseChainId, isUniverseChainId } from 'poki/src/features/chains/types'
import { ChainsConfigKey, DynamicConfigs } from 'poki/src/features/gating/configs'
import { useDynamicConfigValue } from 'poki/src/features/gating/hooks'
import { useMemo } from 'react'

export function useNewChainIds(): UniverseChainId[] {
  const newChainIds = useDynamicConfigValue(DynamicConfigs.Chains, ChainsConfigKey.NewChainIds, [] as number[])
  return useMemo(() => newChainIds.filter(isUniverseChainId), [newChainIds])
}
