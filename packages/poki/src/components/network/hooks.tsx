import { NetworkOption } from 'poki/src/components/network/NetworkOption'
import { useNewChainIds } from 'poki/src/features/chains/hooks/useNewChainIds'
import { UniverseChainId } from 'poki/src/features/chains/types'
import { ElementName } from 'poki/src/features/telemetry/constants'
import { useMemo } from 'react'

export function useNetworkOptions({
  onPress,
  selectedChain,
  includeAllNetworks,
  chainIds,
}: {
  onPress: (chainId: UniverseChainId | null) => void
  selectedChain: UniverseChainId | null
  includeAllNetworks?: boolean
  chainIds: UniverseChainId[]
}): { key: string; onPress: () => void; render: () => JSX.Element }[] {
  const newChains = useNewChainIds()
  return useMemo(
    () =>
      // null here is the "All networks" option
      [...(includeAllNetworks ? [null] : []), ...chainIds].map((chainId) => ({
        key: `${ElementName.NetworkButton}-${chainId ?? 'all'}`,
        render: () => (
          <NetworkOption
            chainId={chainId}
            currentlySelected={selectedChain === chainId}
            isNew={chainId !== null && newChains.includes(chainId)}
          />
        ),
        onPress: () => onPress(chainId),
      })),
    [includeAllNetworks, chainIds, selectedChain, newChains, onPress],
  )
}
