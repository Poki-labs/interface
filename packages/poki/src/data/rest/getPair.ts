/* eslint-disable no-restricted-imports */
import { PartialMessage } from '@bufbuild/protobuf'
import { ConnectError } from '@connectrpc/connect'
import { useQuery } from '@connectrpc/connect-query'
import { UseQueryResult } from '@tanstack/react-query'
import { pokiGetTransport } from 'poki/src/data/rest/base'

/**
 * eslint-disable import/no-unused-modules -- this endpoint is returning stale data sometimes meaning
 * that the data we get (i.e. the dependent amount) is incorrect and the transaction does not complete on chain.
 * Use this endpoint again once the data is more up to date or the trading API handles the data discrepancy.
 */
export function useGetPair(
  input?: PartialMessage<GetPairRequest>,
  enabled = true,
): UseQueryResult<GetPairResponse, ConnectError> {
  return useQuery(getPair, input, { transport: pokiGetTransport, enabled, retry: false })
}
