import { OnSelectCurrency, TokenSection } from 'poki/src/components/TokenSelector/types'
import { IcExplorerTokenDetail } from 'poki/src/types/ic-explorer'
import { memo } from 'react'
import { PlatformSplitStubError } from 'utilities/src/errors'

export type HorizontalTokenListProps = {
  tokens: IcExplorerTokenDetail[]
  onSelectCurrency: OnSelectCurrency
  index: number
  section: TokenSection
  expanded?: boolean
  onExpand?: () => void
}

export const HorizontalTokenList = memo(function HorizontalTokenList(_props: HorizontalTokenListProps): JSX.Element {
  throw new PlatformSplitStubError('TokenSectionBaseList')
})
