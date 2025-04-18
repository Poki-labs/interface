/**
 * Common mocks for this package. This file is intended to be imported in the jest-setup.js file of the package.
 *
 * Notes:
 * * Try not to add test specific mocks here.
 * * Be wary of the import order.
 * * mocks can be overridden
 */

import '@shopify/react-native-skia/jestSetup'
import { mockLocalizationContext } from 'poki/src/test/mocks/locale'
import { mockSharedPersistQueryClientProvider } from 'poki/src/test/mocks/mockSharedPersistQueryClientProvider'
import mockRNLocalize from 'react-native-localize/mock'

jest.mock('react-native-localize', () => mockRNLocalize)
jest.mock('poki/src/features/language/LocalizationContext', () => mockLocalizationContext({}))
jest.mock('poki/src/data/apiClients/SharedPersistQueryClientProvider', () => mockSharedPersistQueryClientProvider)
