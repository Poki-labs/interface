/* eslint-disable no-restricted-imports */
import { SafetyLevel } from 'poki/src/data/graphql/poki-data-api/__generated__/types-and-hooks'
import { logger } from 'utilities/src/logger/logger'

/**
 * Helper functions to parse string enum fields from REST API responses.
 *
 * Note: The Protobuf types use string enums instead of strictly typed enums because
 * Protobuf does not allow defining two of the same enum name in the same proto file. (i.e. both ProtectionAttackType and
 * ProtectionResult contain 'UNKNOWN')
 *
 * Since the Explore service just calls GraphQL, we have confidence the string values will match the GraphQL enums.
 * Just validating here!
 */
function parseSafetyLevel(safetyLevel?: string): SafetyLevel | undefined {
  if (!safetyLevel) {
    return undefined
  }
  const validSafetyLevels: SafetyLevel[] = Object.values(SafetyLevel)
  if (validSafetyLevels.includes(safetyLevel as SafetyLevel)) {
    return safetyLevel as SafetyLevel
  } else {
    logger.warn(
      'poki/data/rest/tokenRankings.ts',
      'parseSafetyLevel',
      `Invalid safetyLevel from REST TokenRankings query: ${safetyLevel}`,
    )
    return undefined
  }
}
