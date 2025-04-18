import { Actor, HttpAgent } from '@dfinity/agent'
import { _SERVICE } from 'poki/src/candid/token-list/AllTokenOfSwap'
import { idlFactory } from 'poki/src/candid/token-list/AllTokenOfSwap.did'

export const allTokenOfSwap = async () => {
  const agent = await HttpAgent.create({ host: 'https://ic0.app' })

  return Actor.createActor<_SERVICE>(idlFactory, {
    agent,
    canisterId: 'aofop-yyaaa-aaaag-qdiqa-cai',
  })
}
