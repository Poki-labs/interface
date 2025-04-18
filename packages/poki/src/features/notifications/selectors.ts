import { createSelector, Selector } from '@reduxjs/toolkit'
import { AppNotification } from 'poki/src/features/notifications/types'
import { PokiState } from 'poki/src/state/pokiReducer'

const selectNotificationQueue = (state: PokiState): AppNotification[] => state.notifications.notificationQueue

export const makeSelectAddressNotifications = (): Selector<
  PokiState,
  AppNotification[] | undefined,
  [Address | null]
> =>
  createSelector(
    selectNotificationQueue,
    (_: PokiState, address: Address | null) => address,
    (notificationQueue, address) => {
      if (!address) {
        return undefined
      }
      // If a notification doesn't have an address param assume it belongs to the active account
      return notificationQueue.filter((notif) => !notif.address || notif.address === address)
    },
  )

const selectNotificationStatus = (
  state: PokiState,
): {
  [userAddress: string]: boolean | undefined
} => state.notifications.notificationStatus

export const makeSelectHasNotifications = (): Selector<PokiState, boolean | undefined, [Address | null]> =>
  createSelector(
    selectNotificationStatus,
    (_: PokiState, address: Address | null) => address,
    (notificationStatuses, address) => {
      if (!address) {
        return undefined
      }
      return notificationStatuses?.[address]
    },
  )

export const selectLastTxNotificationUpdate = (
  state: PokiState,
): {
  [address: string]: number | undefined
} => state.notifications.lastTxNotificationUpdate
