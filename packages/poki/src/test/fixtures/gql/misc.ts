import { Chain, Image } from 'poki/src/data/graphql/poki-data-api/__generated__/types-and-hooks'
import { faker } from 'poki/src/test/shared'
import { createFixture } from 'poki/src/test/utils'

export const GQL_CHAINS = [
  Chain.Ethereum,
  Chain.EthereumSepolia,
  Chain.Arbitrum,
  Chain.Optimism,
  Chain.Polygon,
  Chain.Base,
  Chain.Bnb,
]

export const image = createFixture<Image>()(() => ({
  __typename: 'Image',
  id: faker.datatype.uuid(),
  url: faker.image.imageUrl(),
}))
