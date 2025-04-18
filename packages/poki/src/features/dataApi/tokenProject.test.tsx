import { waitFor } from '@testing-library/react-native'
import { useTokenProjects } from 'poki/src/features/dataApi/tokenProjects'
import { tokenProjectToCurrencyInfos } from 'poki/src/features/dataApi/utils'
import { SAMPLE_CURRENCY_ID_1, usdcTokenProject } from 'poki/src/test/fixtures'
import { renderHook } from 'poki/src/test/test-utils'
import { queryResolvers } from 'poki/src/test/utils'

describe(useTokenProjects, () => {
  it('returns undefined when there is no data', async () => {
    const { resolvers } = queryResolvers({
      tokenProjects: () => undefined,
    })
    const { result } = renderHook(() => useTokenProjects([SAMPLE_CURRENCY_ID_1]), {
      resolvers,
    })

    await waitFor(() => {
      expect(result.current.loading).toEqual(false)
      expect(result.current.data).toBe(undefined)
    })
  })

  it('renders without error', async () => {
    const { resolvers, resolved } = queryResolvers({
      tokenProjects: () => [usdcTokenProject()],
    })
    const { result } = renderHook(() => useTokenProjects([SAMPLE_CURRENCY_ID_1]), {
      resolvers,
    })

    await waitFor(async () => {
      const data = result.current.data
      expect(data).toEqual(tokenProjectToCurrencyInfos(await resolved.tokenProjects))
    })
  })
})
