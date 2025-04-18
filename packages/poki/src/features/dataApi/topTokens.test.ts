import { UniverseChainId } from 'poki/src/features/chains/types'
import { usePopularTokensGql } from 'poki/src/features/dataApi/topTokens'
import { gqlTokenToCurrencyInfo } from 'poki/src/features/dataApi/utils'
import { token } from 'poki/src/test/fixtures'
import { act, renderHook, waitFor } from 'poki/src/test/test-utils'
import { createArray, queryResolvers } from 'poki/src/test/utils'

describe(usePopularTokensGql, () => {
  it('returns loading true when data is being fetched', async () => {
    const { result } = renderHook(() => usePopularTokensGql(UniverseChainId.Mainnet))

    expect(result.current).toEqual({
      data: undefined,
      loading: true,
      error: undefined,
      refetch: expect.any(Function),
    })

    await act(() => undefined)
  })

  it('returns error when data fetching fails', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined)

    const { resolvers } = queryResolvers({
      topTokens: () => {
        throw new Error('test error')
      },
    })
    const { result } = renderHook(() => usePopularTokensGql(UniverseChainId.Mainnet), {
      resolvers,
    })

    await waitFor(() => {
      expect(result.current).toEqual({
        data: undefined,
        loading: false,
        error: new Error('test error'),
        refetch: expect.any(Function),
      })
    })
  })

  it('returns data when data fetching succeeds', async () => {
    const topToken = createArray(3, token)
    const { resolvers } = queryResolvers({
      topTokens: () => topToken,
    })
    const { result } = renderHook(() => usePopularTokensGql(UniverseChainId.Mainnet), {
      resolvers,
    })

    await waitFor(() => {
      expect(result.current).toEqual({
        data: topToken.map(gqlTokenToCurrencyInfo),
        loading: false,
        error: undefined,
        refetch: expect.any(Function),
      })
    })
  })
})
