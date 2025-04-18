import { ProtocolItems } from 'poki/src/data/tradingApi/__generated__'
import { UniverseChainId } from 'poki/src/features/chains/types'
import { ArbitrumXV2SamplingProperties, Experiments } from 'poki/src/features/gating/experiments'
import { FeatureFlags } from 'poki/src/features/gating/flags'
import { useExperimentValue, useFeatureFlag } from 'poki/src/features/gating/hooks'
import { useMemo } from 'react'

export const DEFAULT_PROTOCOL_OPTIONS = [
  // `as const` allows us to derive a type narrower than ProtocolItems, and the `...` spread removes readonly, allowing DEFAULT_PROTOCOL_OPTIONS to be passed around as an argument without `readonly`
  ...([ProtocolItems.POKIX_V2, ProtocolItems.V4, ProtocolItems.V3, ProtocolItems.V2] as const),
]
export type FrontendSupportedProtocol = (typeof DEFAULT_PROTOCOL_OPTIONS)[number]

const LAUNCHED_POKIX_CHAINS = [UniverseChainId.Mainnet]

/** Given a list of `userSelectedProtocols`, returns protocol items that are allowed for the given chain. */
export function useProtocolsForChain(
  userSelectedProtocols: FrontendSupportedProtocol[],
  chainId?: UniverseChainId,
): ProtocolItems[] {
  const pokiXEnabled = useFeatureFlag(FeatureFlags.PokiX)
  const priorityOrdersAllowed = usePokiXPriorityOrderFlag(chainId)
  const xv2ArbitrumRoutingType = useExperimentValue<
    Experiments.ArbitrumXV2Sampling,
    ArbitrumXV2SamplingProperties.RoutingType,
    'CLASSIC' | 'DUTCH_V2' | 'DUTCH_V3'
  >(Experiments.ArbitrumXV2Sampling, ArbitrumXV2SamplingProperties.RoutingType, 'CLASSIC')
  const arbPokiXAllowed = chainId === UniverseChainId.ArbitrumOne && xv2ArbitrumRoutingType !== 'CLASSIC'

  const pokiXAllowedForChain =
    (chainId && LAUNCHED_POKIX_CHAINS.includes(chainId)) || priorityOrdersAllowed || arbPokiXAllowed
  const v4SwapAllowed = useFeatureFlag(FeatureFlags.V4Swap)
  return useMemo(() => {
    let protocols: ProtocolItems[] = [...userSelectedProtocols]
    // Remove PokiX from the options we send to TradingAPI if PokiX hasn't been launched or isn't in experiment on that chain
    if (!pokiXAllowedForChain || !pokiXEnabled) {
      protocols = protocols.filter((protocol) => protocol !== ProtocolItems.POKIX_V2)
    }
    // Replace PokiXV2 with V3 if V3 experiment is enabled on arbitrum
    if (arbPokiXAllowed && xv2ArbitrumRoutingType === 'DUTCH_V3') {
      protocols = protocols.map((protocol) => (protocol === ProtocolItems.POKIX_V2 ? ProtocolItems.POKIX_V3 : protocol))
    }

    // Remove PokiX from the options we send to TradingAPI if PokiX hasn't been launched or isn't in experiment on that chain
    if (!pokiXAllowedForChain || !pokiXEnabled) {
      protocols = protocols.filter((protocol) => protocol !== ProtocolItems.POKIX_V2)
    }

    if (!v4SwapAllowed) {
      protocols = protocols.filter((protocol) => protocol !== ProtocolItems.V4)
    }

    return protocols
  }, [
    pokiXAllowedForChain,
    pokiXEnabled,
    userSelectedProtocols,
    v4SwapAllowed,
    xv2ArbitrumRoutingType,
    arbPokiXAllowed,
  ])
}

export function usePokiXPriorityOrderFlag(chainId?: UniverseChainId): boolean {
  const flagName = POKI_PRIORITY_ORDERS_CHAIN_FLAG_MAP[chainId ?? UniverseChainId.Base]
  const result = useFeatureFlag(flagName ?? FeatureFlags.PokiXPriorityOrdersBase)

  if (!chainId) {
    return false
  }

  if (!flagName) {
    return false
  }

  return result
}

// These are primarily OP stack chains, since only Priority Orders can only operate on chains with Priority Gas Auctions (PGA)
const POKI_PRIORITY_ORDERS_CHAIN_FLAG_MAP: Partial<Record<UniverseChainId, FeatureFlags>> = {
  [UniverseChainId.Base]: FeatureFlags.PokiXPriorityOrdersBase,
  [UniverseChainId.Optimism]: FeatureFlags.PokiXPriorityOrdersOptimism,
  [UniverseChainId.Unichain]: FeatureFlags.PokiXPriorityOrdersUnichain,
}
