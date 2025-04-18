import { TypedDataField } from 'ethers/lib/ethers'
import { useSigner } from 'poki/src/contexts/PokiContext'
import { Permit } from 'poki/src/data/tradingApi/__generated__/index'
import { signTypedData } from 'poki/src/features/transactions/signing'
import { useCallback } from 'react'
import { useAsyncData } from 'utilities/src/react/hooks'

export type PermitSignatureInfo = {
  signature: string
  permitMessage: PermitSingle
  nonce: number
  expiry: number
}

// Used to sign permit messages where we already have the domain, types, and values.
export function usePermit2SignatureWithData({ permitData, skip }: { permitData: Maybe<Permit>; skip?: boolean }): {
  isLoading: boolean
  signature: string | undefined
} {
  const signer = useSigner()

  const { domain, types, values } = permitData || {}

  const permitSignatureFetcher = useCallback(async () => {
    if (skip || !signer || !domain || !types || !values) {
      return undefined
    }

    return await signTypedData(
      domain,
      types as Record<string, TypedDataField[]>,
      values as Record<string, unknown>,
      signer,
    )
  }, [domain, signer, skip, types, values])

  const { data, isLoading } = useAsyncData(permitSignatureFetcher)

  return {
    isLoading,
    signature: data,
  }
}
