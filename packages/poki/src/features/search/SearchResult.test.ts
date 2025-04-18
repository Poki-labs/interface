import { ENS_SUFFIX } from 'poki/src/features/ens/constants'
import { SearchResultType, extractDomain } from 'poki/src/features/search/SearchResult'
import { UNITAG_SUFFIX } from 'poki/src/features/unitags/constants'

describe('extractDomain', () => {
  it.each`
    walletName              | type                           | expected
    ${'test'}               | ${SearchResultType.Unitag}     | ${UNITAG_SUFFIX}
    ${'test'}               | ${SearchResultType.ENSAddress} | ${ENS_SUFFIX}
    ${'test.'}              | ${SearchResultType.Unitag}     | ${UNITAG_SUFFIX}
    ${'test.eth'}           | ${SearchResultType.ENSAddress} | ${'.eth'}
    ${'test.poki.eth'}       | ${SearchResultType.Unitag}     | ${'.poki.eth'}
    ${'test.something.eth'} | ${SearchResultType.ENSAddress} | ${'.something.eth'}
    ${'test.cb.id'}         | ${SearchResultType.ENSAddress} | ${'.cb.id'}
  `('walletName=$walletName type=$type should return expected=$expected', ({ walletName, type, expected }) => {
    expect(extractDomain(walletName, type)).toEqual(expected)
  })
})
