import { PropsWithChildren } from 'react'
/* eslint-disable no-restricted-imports */
import { ModalNameType } from 'poki/src/features/telemetry/constants'
import { TransactionModalContextState } from 'poki/src/features/transactions/TransactionModal/TransactionModalContext'
import type { StyleProp } from 'react-native/Libraries/StyleSheet/StyleSheet'
import type { ViewStyle } from 'react-native/Libraries/StyleSheet/StyleSheetTypes'

export type TransactionModalProps = PropsWithChildren<{
  modalName: ModalNameType
  onClose: () => void
  onCurrencyChange?: TransactionModalContextState['onCurrencyChange']
  openWalletRestoreModal?: TransactionModalContextState['openWalletRestoreModal']
  swapRedirectCallback?: TransactionModalContextState['swapRedirectCallback']
  renderBiometricsIcon?: TransactionModalContextState['renderBiometricsIcon']
  walletNeedsRestore?: TransactionModalContextState['walletNeedsRestore']
  authTrigger?: TransactionModalContextState['authTrigger']
}>

export type TransactionModalInnerContainerProps = PropsWithChildren<{
  bottomSheetViewStyles: StyleProp<ViewStyle>
  fullscreen: boolean
}>

export type TransactionModalFooterContainerProps = PropsWithChildren
