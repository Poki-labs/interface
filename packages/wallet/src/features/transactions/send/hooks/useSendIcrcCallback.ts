import { Principal } from '@dfinity/principal'
import { useMemo } from 'react'
import { icrc1 } from 'poki/src/actor/index'
import { resultFormat } from 'utilities/src/format/resultFormat'
import { useActiveAccountIdentity } from 'wallet/src/features/wallet/hooks'

/** Helper send callback for ERC20s */
export function useSendIcrcCallback(
  tokenId: string | null | undefined,
  to: string | null | undefined,
  amount: string | null | undefined,
) {
  const activeAccount = useActiveAccountIdentity()

  return useMemo(() => {
    if (!tokenId || !to || !amount || !activeAccount) return null

    return async () => {
      const transferResult = await (
        await icrc1(tokenId, activeAccount.identity)
      ).icrc1_transfer({
        to: { owner: Principal.fromText(to), subaccount: [] },
        fee: [],
        memo: [],
        from_subaccount: [],
        created_at_time: [],
        amount: BigInt(amount),
      })

      return resultFormat<bigint>(transferResult)
    }
  }, [tokenId, to, amount, activeAccount])
}
