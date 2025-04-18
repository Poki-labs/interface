import type { PartialMessage } from '@bufbuild/protobuf'
import { ConnectError } from '@connectrpc/connect'
import { useMutation } from '@connectrpc/connect-query'
import { UseMutationResult } from '@tanstack/react-query'
import { createConnectTransportWithDefaults } from 'poki/src/data/rest/base'
import { proxy } from 'poki/src/data/rest/conversionTracking/api/api-ConversionProxyService_connectquery'
import { ProxyRequest, ProxyResponse } from 'poki/src/data/rest/conversionTracking/api/api_pb'
import { getConversionProxyApiBaseUrl } from 'poki/src/data/rest/conversionTracking/utils'

const conversionProxyTransport = createConnectTransportWithDefaults({
  baseUrl: getConversionProxyApiBaseUrl(),
})

export function useConversionProxy(): UseMutationResult<ProxyResponse, ConnectError, PartialMessage<ProxyRequest>> {
  return useMutation(proxy, { transport: conversionProxyTransport })
}
