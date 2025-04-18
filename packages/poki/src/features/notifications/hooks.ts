import { makeSelectAddressNotifications, makeSelectHasNotifications } from 'poki/src/features/notifications/selectors'
import { AppNotification } from 'poki/src/features/notifications/types'
import { PokiState } from 'poki/src/state/pokiReducer'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'

export function useSelectAddressHasNotifications(address: Address | null): boolean | undefined {
  const selectHasNotifications = useMemo(makeSelectHasNotifications, [])
  return useSelector((state: PokiState) => selectHasNotifications(state, address))
}

export function useSelectAddressNotifications(address: Address | null): AppNotification[] | undefined {
  const selectAddressNotifications = useMemo(makeSelectAddressNotifications, [])
  return useSelector((state: PokiState) => selectAddressNotifications(state, address))
}
