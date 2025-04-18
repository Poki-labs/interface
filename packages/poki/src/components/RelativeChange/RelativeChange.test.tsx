import { RelativeChange } from 'poki/src/components/RelativeChange/RelativeChange'
import { FiatCurrencyInfo } from 'poki/src/features/fiatOnRamp/types'
import { Locale } from 'poki/src/features/language/constants'
import { renderWithProviders } from 'poki/src/test/render'

const mockLocale = Locale.EnglishUnitedStates

jest.mock('poki/src/features/language/hooks', () => ({
  useCurrentLocale: (): Locale => mockLocale,
}))

const mockFiatCurrencyInfo: FiatCurrencyInfo = {
  name: 'United States Dollar',
  shortName: 'USD ($)',
  code: 'USD',
  symbol: '$',
  groupingSeparator: ',',
  decimalSeparator: '.',
  fullSymbol: '$',
  symbolAtFront: true,
}

jest.mock('poki/src/features/fiatCurrency/hooks', () => ({
  useAppFiatCurrencyInfo: (): FiatCurrencyInfo => mockFiatCurrencyInfo,
}))

it('renders a relative change', () => {
  const tree = renderWithProviders(<RelativeChange change={12} />)
  expect(tree).toMatchSnapshot()
})

it('renders placeholders without a change', () => {
  const tree = renderWithProviders(<RelativeChange />)
  expect(tree).toMatchSnapshot()
})

it('renders placeholders with absolute change', () => {
  const tree = renderWithProviders(<RelativeChange absoluteChange={100} change={12} />)
  expect(tree).toMatchSnapshot()
})
