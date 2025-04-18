import {
  NftAsset,
  NftAssetTrait,
  NftCollection,
  NftContract,
} from 'poki/src/data/graphql/poki-data-api/__generated__/types-and-hooks'
import { GQL_CHAINS, image } from 'poki/src/test/fixtures/gql/misc'
import { faker } from 'poki/src/test/shared'
import { createArray, createFixture, randomChoice } from 'poki/src/test/utils'

/**
 * Base fixtures
 */

export const nftAsset = createFixture<NftAsset>()(() => ({
  __typename: 'NftAsset',
  id: faker.datatype.uuid(),
  tokenId: faker.datatype.uuid(),
}))

export const nftAssetTrait = createFixture<NftAssetTrait>()(() => ({
  __typename: 'NftAssetTrait',
  id: faker.datatype.uuid(),
  name: faker.lorem.word(),
  value: faker.lorem.word(),
}))

export const nftContract = createFixture<NftContract>()(() => ({
  __typename: 'NftContract',
  id: faker.datatype.uuid(),
  chain: randomChoice(GQL_CHAINS),
  address: faker.finance.ethereumAddress(),
}))

type NftCollectionOptions = {
  contractsCount: number
}

export const nftCollection = createFixture<NftCollection, NftCollectionOptions>({
  contractsCount: 2,
})(({ contractsCount }) => ({
  __typename: 'NftCollection',
  id: faker.datatype.uuid(),
  name: faker.lorem.word(),
  collectionId: faker.datatype.uuid(),
  isVerified: faker.datatype.boolean(),
  nftContracts: createArray(contractsCount, nftContract),
  image: image(),
}))

/**
 * Static fixtures
 */

export const NFT_ASSET_TRAIT = nftAssetTrait({
  name: 'traitName',
  value: 'traitValue',
})

export const NFT_COLLECTION = nftCollection({
  nftContracts: [nftContract()],
  name: 'Test NFT 1',
  image: image({ url: 'image.url' }),
  isVerified: true,
})
