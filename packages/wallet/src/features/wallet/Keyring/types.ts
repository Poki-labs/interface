/* eslint-disable max-lines */
import { Secp256k1KeyIdentity } from '@dfinity/identity-secp256k1'

export enum ErrorType {
  StoreMnemonicError = 'storeMnemonicError',
  RetrieveMnemonicError = 'retrieveMnemonicError',
  RetrievePasswordError = 'retrievePasswordError',
}

export type AccountCredentials = {
  mnemonic: string
  identity: Secp256k1KeyIdentity
  principal: string
}
