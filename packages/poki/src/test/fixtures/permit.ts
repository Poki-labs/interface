import { ValidatedPermit } from 'poki/src/features/transactions/swap/utils/trade'

export const mockPermit = {
  domain: {
    name: 'Poki',
    version: '1.0',
    chainId: 1,
    verifyingContract: '0x123',
  },
  types: {
    real: 'data',
  },
  values: {
    such: 'permit',
  },
} satisfies ValidatedPermit
