import { GraphQLJSON } from 'graphql-scalars'
import { HistoryDuration, Resolvers } from 'poki/src/data/graphql/poki-data-api/__generated__/types-and-hooks'
import { priceHistory, tokenProject } from 'poki/src/test/fixtures'

export const defaultResolvers: Resolvers = {
  Query: {
    tokenProjects: (parent, args, context, info) => [
      tokenProject({
        priceHistory: priceHistory({
          duration: (info.variableValues.duration as HistoryDuration) ?? HistoryDuration.Day,
        }),
      }),
    ],
  },
  AWSJSON: GraphQLJSON,
}
