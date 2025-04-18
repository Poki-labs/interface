/* eslint-disable no-restricted-imports */
import { PartialMessage } from '@bufbuild/protobuf'
import { ConnectError } from '@connectrpc/connect'
import { useInfiniteQuery, useQuery } from '@connectrpc/connect-query'
import { InfiniteData, UseInfiniteQueryResult, UseQueryResult, keepPreviousData } from '@tanstack/react-query'
import { pokiGetTransport } from 'poki/src/data/rest/base'

export function useGetPositionsQuery(
  input?: PartialMessage<ListPositionsRequest>,
  disabled?: boolean,
): UseQueryResult<ListPositionsResponse, ConnectError> {
  return useQuery(listPositions, input, {
    transport: pokiGetTransport,
    enabled: !!input && !disabled,
    placeholderData: keepPreviousData,
  })
}

export function useGetPositionsInfiniteQuery(
  input: PartialMessage<ListPositionsRequest> & { pageToken: string },
  disabled?: boolean,
): UseInfiniteQueryResult<InfiniteData<ListPositionsResponse>, ConnectError> {
  return useInfiniteQuery(listPositions, input, {
    transport: pokiGetTransport,
    enabled: !!input && !disabled,
    pageParamKey: 'pageToken',
    getNextPageParam: (lastPage) => lastPage.nextPageToken,
    placeholderData: keepPreviousData,
  })
}

function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined
}
