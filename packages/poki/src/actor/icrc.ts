import { Actor, HttpAgent } from '@dfinity/agent'
import { Secp256k1KeyIdentity } from '@dfinity/identity-secp256k1'
import { _SERVICE } from 'poki/src/candid/icrc/icrc1'
import { idlFactory } from 'poki/src/candid/icrc/icrc1.did'

export const icrc1 = async (tokenId: string, identity?: Secp256k1KeyIdentity) => {
  const agent = await HttpAgent.create({ host: 'https://ic0.app', identity })

  return Actor.createActor<_SERVICE>(idlFactory, {
    agent,
    canisterId: tokenId,
  })
}
