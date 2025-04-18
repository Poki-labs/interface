import { AccountType } from 'poki/src/features/accounts/types'
import { useENSName } from 'poki/src/features/ens/api'
import { Statsig } from 'poki/src/features/gating/sdk/statsig'
import { useUnitagByAddress } from 'poki/src/features/unitags/hooks'
import { getValidAddress } from 'poki/src/utils/addresses'
import { useEffect } from 'react'
import { logger } from 'utilities/src/logger/logger'
import { useActiveAccount } from 'wallet/src/features/wallet/hooks'

export function useGatingUserPropertyUsernames(): void {
  const activeAccount = useActiveAccount()
  const validatedAddress = getValidAddress(activeAccount?.address)
  const { data: ens } = useENSName(validatedAddress ?? undefined)
  const { unitag } = useUnitagByAddress(validatedAddress ?? undefined)

  useEffect(() => {
    if (activeAccount?.type === AccountType.SignerMnemonic) {
      const user = Statsig.getCurrentUser()
      Statsig.updateUser({
        ...user,
        privateAttributes: {
          ...user?.privateAttributes,
          unitag: unitag?.username,
          ens: ens?.split('.')[0],
        },
      }).catch((error) => {
        logger.warn('userPropertyHooks', 'useGatingUserPropertyUsernames', 'Failed to set usernames for gating', error)
      })
    }
  }, [activeAccount, ens, unitag?.username])
}
