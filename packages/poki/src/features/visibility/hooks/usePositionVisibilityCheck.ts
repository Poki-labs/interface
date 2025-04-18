import { UniverseChainId } from 'poki/src/features/chains/types'
import { selectPositionsVisibility } from 'poki/src/features/visibility/selectors'
import { getUniquePositionId } from 'poki/src/features/visibility/utils'
import { PokiRootState } from 'poki/src/state'
import { useSelector } from 'react-redux'

type VisibilityCheckParams = {
  poolId: string
  tokenId: string | undefined
  chainId: UniverseChainId
  isFlaggedSpam?: boolean
}

export function usePositionVisibilityCheck(): (params: VisibilityCheckParams) => boolean {
  const positionVisibilities = useSelector((state: PokiRootState) => selectPositionsVisibility(state))

  const isPositionVisible = ({ poolId, tokenId, chainId, isFlaggedSpam = false }: VisibilityCheckParams): boolean => {
    const positionId = getUniquePositionId(poolId, tokenId, chainId)
    const positionState = positionVisibilities[positionId]

    if (positionState === undefined) {
      // If undefined, default to visible unless flagged as spam by the API (i.e. the isHidden property on Position)
      return !isFlaggedSpam
    }

    // Return the explicitly set visibility
    return positionState.isVisible
  }

  return isPositionVisible
}
