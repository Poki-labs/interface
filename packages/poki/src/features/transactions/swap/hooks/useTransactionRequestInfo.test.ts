import { renderHook } from '@testing-library/react-hooks'
import { providers } from 'ethers/lib/ethers'
import { useTradingApiSwapQuery } from 'poki/src/data/apiClients/tradingApi/useTradingApiSwapQuery'
import { AccountMeta, AccountType } from 'poki/src/features/accounts/types'
import { UniverseChainId } from 'poki/src/features/chains/types'
import { useTransactionGasFee } from 'poki/src/features/gas/hooks'
import { GasFeeResult } from 'poki/src/features/gas/types'
import { usePermit2SignatureWithData } from 'poki/src/features/transactions/swap/hooks/usePermit2Signature'
import { useTransactionRequestInfo } from 'poki/src/features/transactions/swap/hooks/useTransactionRequestInfo'
import { useWrapTransactionRequest } from 'poki/src/features/transactions/swap/hooks/useWrapTransactionRequest'
import { WrapType } from 'poki/src/features/transactions/types/wrap'
import { ETH, WETH } from 'poki/src/test/fixtures'
import { createMockDerivedSwapInfo, createMockTokenApprovalInfo } from 'poki/src/test/fixtures/transactions/swap'

jest.mock('poki/src/data/apiClients/tradingApi/useTradingApiSwapQuery')
jest.mock('poki/src/features/transactions/swap/hooks/usePermit2Signature')
jest.mock('poki/src/features/transactions/swap/hooks/useWrapTransactionRequest')
jest.mock('poki/src/features/gas/hooks')
jest.mock('poki/src/features/gating/hooks', () => {
  return {
    ...jest.requireActual('poki/src/features/gating/hooks'),
    useDynamicConfigValue: jest.fn().mockImplementation((config: unknown, key: unknown, defaultVal: unknown) => {
      return defaultVal
    }),
  }
})

const mockUseTradingApiSwapQuery = useTradingApiSwapQuery as jest.Mock
const mockUsePermit2SignatureWithData = usePermit2SignatureWithData as jest.Mock
const mockUseWrapTransactionRequest = useWrapTransactionRequest as jest.Mock
const mockUseTransactionGasFee = useTransactionGasFee as jest.Mock

describe('useTransactionRequestInfo', () => {
  const mockAccount: AccountMeta = { address: '0x123', type: AccountType.SignerMnemonic }
  const mockWrapGasFee: GasFeeResult = {
    value: '250000',
    params: {
      gasLimit: '250000',
      maxFeePerGas: '300000',
      maxPriorityFeePerGas: '350000',
    },
    isLoading: false,
    error: null,
  }
  const swapQueryResult = {
    data: {
      requestId: '123',
      swap: {
        from: '0x123',
        data: '0x',
        value: '0',
        to: '0xSwap',
        chainId: UniverseChainId.Mainnet,
        gasLimit: '500000',
        maxFeePerGas: '600000',
        maxPriorityFeePerGas: '700000',
      },
    },
    error: null,
    isLoading: false,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should include gas fee values from wrapGasFee in the returned wrap transactionRequest', () => {
    // Swap needs wrapping
    const mockDerivedSwapInfo = createMockDerivedSwapInfo(ETH, WETH, '1000000000000000000', '1000000000', {
      wrapType: WrapType.Wrap,
    })
    mockUseWrapTransactionRequest.mockReturnValue({
      to: '0xWrap',
      chainId: UniverseChainId.Mainnet,
    })
    mockUsePermit2SignatureWithData.mockReturnValue({ signature: undefined, isLoading: false })
    mockUseTradingApiSwapQuery.mockReturnValue(swapQueryResult)
    mockUseTransactionGasFee.mockReturnValue(mockWrapGasFee)

    const { result } = renderHook(() =>
      useTransactionRequestInfo({
        derivedSwapInfo: mockDerivedSwapInfo,
        tokenApprovalInfo: createMockTokenApprovalInfo(),
        account: mockAccount,
        skip: false,
      }),
    )

    expect(result.current.transactionRequest).toMatchObject<providers.TransactionRequest>({
      to: '0xWrap',
      chainId: UniverseChainId.Mainnet,
      gasLimit: '250000',
      maxFeePerGas: '300000',
      maxPriorityFeePerGas: '350000',
    })
  })

  it('should return the swap transactionRequest when wrap is not applicable', () => {
    // Swap does not need wrapping
    const mockDerivedSwapInfo = createMockDerivedSwapInfo(ETH, WETH, '1000000000000000000', '1000000000')

    mockUseWrapTransactionRequest.mockReturnValue(null)
    mockUsePermit2SignatureWithData.mockReturnValue({ signature: undefined, isLoading: false })
    mockUseTradingApiSwapQuery.mockReturnValue(swapQueryResult)
    mockUseTransactionGasFee.mockReturnValue({ error: null, isLoading: false })

    const { result } = renderHook(() =>
      useTransactionRequestInfo({
        derivedSwapInfo: mockDerivedSwapInfo,
        tokenApprovalInfo: createMockTokenApprovalInfo(),
        account: mockAccount,
        skip: false,
      }),
    )

    expect(result.current.transactionRequest).toMatchObject<providers.TransactionRequest>({
      to: '0xSwap',
      chainId: UniverseChainId.Mainnet,
      gasLimit: '500000',
      maxFeePerGas: '600000',
      maxPriorityFeePerGas: '700000',
    })
  })
})
