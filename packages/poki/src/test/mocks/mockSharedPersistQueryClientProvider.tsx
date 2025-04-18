import { QueryClientProvider } from '@tanstack/react-query'
import { SharedQueryClient } from 'poki/src/data/apiClients/SharedQueryClient'
import { PropsWithChildren } from 'react'

export const mockSharedPersistQueryClientProvider = {
  SharedPersistQueryClientProvider: jest.fn().mockImplementation(MockedSharedPersistQueryClientProvider),
}

function MockedSharedPersistQueryClientProvider({ children }: PropsWithChildren): JSX.Element {
  return <QueryClientProvider client={SharedQueryClient}>{children}</QueryClientProvider>
}
