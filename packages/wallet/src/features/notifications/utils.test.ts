import { TradeType } from 'poki/src/sdk-core'
import { DAI, USDC } from 'poki/src/constants/tokens'
import { Locale } from 'poki/src/features/language/constants'
import { TransactionStatus } from 'poki/src/features/transactions/types/transactionDetails'
import { mockLocalizedFormatter } from 'poki/src/test/mocks'
import { formSwapNotificationTitle } from 'wallet/src/features/notifications/utils'

const mockFormatter = mockLocalizedFormatter(Locale.EnglishUnitedStates)

describe(formSwapNotificationTitle, () => {
  it('formats successful local swap title', () => {
    expect(
      formSwapNotificationTitle(
        mockFormatter,
        TransactionStatus.Success,
        DAI,
        USDC,
        '1-DAI',
        '1-USDC',
        '1000000000000000000',
        '1000000',
        TradeType.EXACT_INPUT,
      ),
    ).toEqual('Swapped 1.00 DAI for ~1.00 USDC.')
  })

  it('formats successful remote swap title', () => {
    expect(
      formSwapNotificationTitle(
        mockFormatter,
        TransactionStatus.Success,
        DAI,
        USDC,
        '1-DAI',
        '1-USDC',
        '1000000000000000000',
        '1200000',
      ),
    ).toEqual('Swapped 1.00 DAI for 1.20 USDC.')
  })

  it('formats canceled swap title', () => {
    expect(
      formSwapNotificationTitle(
        mockFormatter,
        TransactionStatus.Canceled,
        DAI,
        USDC,
        '1-DAI',
        '1-USDC',
        '1000000000000000000',
        '1000000',
        TradeType.EXACT_INPUT,
      ),
    ).toEqual('Canceled DAI-USDC swap.')
  })

  it('formats failed swap title', () => {
    expect(
      formSwapNotificationTitle(
        mockFormatter,
        TransactionStatus.Failed,
        DAI,
        USDC,
        '1-DAI',
        '1-USDC',
        '1000000000000000000',
        '1000000',
        TradeType.EXACT_INPUT,
      ),
    ).toEqual('Failed to swap 1.00 DAI for ~1.00 USDC.')
  })
})
