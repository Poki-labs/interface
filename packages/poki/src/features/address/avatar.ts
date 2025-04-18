// import { useENSAvatar } from 'poki/src/features/ens/api'
// import { useUnitagByAddress } from 'poki/src/features/unitags/hooks'
// import { isValidPrincipal } from 'utilities/src/addresses'

/*
 * Fetches avatar for address, in priority uses: unitag avatar, ens avatar, undefined
 *  Note that this hook is used instead of just useENSAvatar because our implementation
 *  of useENSAvatar checks for reverse name resolution which Unitags does not support.
 *  Chose to do this because even if we used useENSAvatar without reverse name resolution,
 *  there is more latency because it has to go to the contract via CCIP-read first.
 */
export function useAvatar(address: Maybe<string>): {
  avatar: Maybe<string>
  loading: boolean
} {
  // const validated = isValidPrincipal(address ?? '')
  // const { data: ensAvatar, isLoading: ensLoading } = useENSAvatar(address)
  // const { unitag, loading: unitagLoading } = useUnitagByAddress(undefined)

  // const unitagAvatar = unitag?.metadata?.avatar

  // if (unitagAvatar) {
  //   return { avatar: unitagAvatar, loading: false }
  // }

  // if (ensAvatar) {
  //   return { avatar: ensAvatar, loading: false }
  // }

  return { avatar: undefined, loading: false }
  // return { avatar: undefined, loading: ensLoading || unitagLoading }
}
