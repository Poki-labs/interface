import { faker } from 'poki/src/test/shared'
import { createFixture } from 'poki/src/test/utils'
import { DappInfoUwULink, DappInfoWC } from 'poki/src/types/walletConnect'

export const dappInfoWC = createFixture<DappInfoWC>()(() => ({
  source: 'walletconnect',
  name: faker.lorem.words(),
  url: faker.internet.url(),
  icon: faker.image.imageUrl(),
}))

export const dappInfoUwULink = createFixture<DappInfoUwULink>()(() => ({
  source: 'uwulink',
  name: faker.lorem.words(),
  url: faker.internet.url(),
  icon: faker.image.imageUrl(),
  chain_id: faker.datatype.number(),
}))
