import {
  SwapOrderDetails,
  SwapOrderStatus,
  SwapOrderType,
} from 'poki/src/data/graphql/poki-data-api/__generated__/types-and-hooks'
import { daiToken, ethToken } from 'poki/src/test/fixtures/gql/assets'
import { faker } from 'poki/src/test/shared'
import { createFixture, randomEnumValue } from 'poki/src/test/utils'

export const swapOrderDetails = createFixture<SwapOrderDetails>()(() => ({
  __typename: 'SwapOrderDetails',
  id: faker.datatype.uuid(),
  hash: faker.datatype.uuid(),
  expiry: faker.date.future().getTime(),
  inputToken: ethToken(),
  inputTokenQuantity: faker.datatype.float({ min: 0, max: 1000, precision: 0.01 }).toString(),
  offerer: faker.finance.ethereumAddress(),
  outputToken: daiToken(),
  outputTokenQuantity: faker.datatype.float({ min: 0, max: 1000, precision: 0.01 }).toString(),
  /** @deprecated use swapOrderStatus to disambiguate from transactionStatus */
  status: randomEnumValue(SwapOrderStatus),
  swapOrderStatus: randomEnumValue(SwapOrderStatus),
  encodedOrder: faker.datatype.string(),
  swapOrderType: SwapOrderType.Dutch,
}))
