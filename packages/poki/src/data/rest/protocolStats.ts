/* eslint-disable no-restricted-imports */
import { PartialMessage } from '@bufbuild/protobuf'
import { ConnectError } from '@connectrpc/connect'
import { useQuery } from '@connectrpc/connect-query'
import { UseQueryResult } from '@tanstack/react-query'
import { pokiGetTransport } from 'poki/src/data/rest/base'

/**
 * Wrapper around Tanstack useQuery for the Poki REST BE service ProtocolStats
 * This includes data for protocol TVL and volume graphs
 * @param input { chainId: string } - string representation of the chain to query or `ALL_NETWORKS` for aggregated data
 * @returns UseQueryResult<ProtocolStatsResponse, ConnectError>
 */
export function useProtocolStatsQuery(
  input?: PartialMessage<ProtocolStatsRequest>,
): UseQueryResult<ProtocolStatsResponse, ConnectError> {
  return useQuery(protocolStats, input, { transport: pokiGetTransport })
}
