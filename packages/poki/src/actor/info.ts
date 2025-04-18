import { Actor, HttpAgent } from '@dfinity/agent'
import { _SERVICE } from 'poki/src/candid/info/node_index'
import { idlFactory } from 'poki/src/candid/info/node_index.did'

export const node_index = async () => {
  const agent = await HttpAgent.create({ host: 'https://ic0.app' })

  return Actor.createActor<_SERVICE>(idlFactory, {
    agent,
    canisterId: 'ggzvv-5qaaa-aaaag-qck7a-cai',
  })
}
