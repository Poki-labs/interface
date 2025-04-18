import { Portfolio } from 'poki/src/data/graphql/poki-data-api/__generated__/types-and-hooks'
import { assetActivity } from 'poki/src/test/fixtures/gql'
import { amount } from 'poki/src/test/fixtures/gql/amounts'
import { tokenBalance } from 'poki/src/test/fixtures/gql/assets'
import { faker } from 'poki/src/test/shared'
import { createArray, createFixture } from 'poki/src/test/utils'

type PortfolioOptions = {
  activitiesCount: number
  tokenBalancesCount: number
}

export const portfolio = createFixture<Portfolio, PortfolioOptions>({
  activitiesCount: 2,
  tokenBalancesCount: 2,
})(({ tokenBalancesCount, activitiesCount }) => ({
  __typename: 'Portfolio',
  id: faker.datatype.uuid(),
  ownerAddress: faker.finance.ethereumAddress(),
  // Optional properties based on token balances count
  ...(tokenBalancesCount > 0
    ? {
        tokensTotalDenominatedValue: amount(),
        tokensTotalDenominatedValueChange: {
          id: faker.datatype.uuid(),
          absolute: amount(),
          percentage: amount(),
        },
        tokenBalances: createArray(tokenBalancesCount, tokenBalance),
      }
    : {}),
  // Optional properties based on activitiesCount
  ...(activitiesCount
    ? {
        assetActivities: createArray(activitiesCount, assetActivity),
      }
    : {}),
}))
