import { TokenSectionHeaderProps } from 'poki/src/components/TokenSelector/items/TokenSectionHeader'
import { TokenSection } from 'poki/src/components/TokenSelector/types'
import { IcExplorerTokenDetail } from 'poki/src/types/ic-explorer'
import { EffectCallback, MutableRefObject } from 'react'
import { PlatformSplitStubError } from 'utilities/src/errors'

export interface TokenSectionBaseListRef {
  scrollToLocation: (params: { itemIndex: number; sectionIndex: number; animated: boolean }) => void
}

export type SectionRowInfo = { section: TokenSectionHeaderProps }

export interface ItemRowInfo {
  item: IcExplorerTokenDetail | IcExplorerTokenDetail[]
  section: TokenSection
  index: number
  expanded?: boolean
}

export interface TokenSectionBaseListProps {
  sectionListRef?: MutableRefObject<TokenSectionBaseListRef | undefined>
  ListEmptyComponent?: JSX.Element
  focusHook?: (callback: EffectCallback) => void
  keyExtractor?: (item: IcExplorerTokenDetail | IcExplorerTokenDetail[], index: number) => string
  renderItem: (info: ItemRowInfo) => JSX.Element | null
  renderSectionHeader?: (info: SectionRowInfo) => JSX.Element
  renderSectionFooter?: (info: SectionRowInfo) => JSX.Element
  sections: TokenSection[]
  expandedItems?: string[]
}

export function TokenSectionBaseList(_props: TokenSectionBaseListProps): JSX.Element {
  throw new PlatformSplitStubError('TokenSectionBaseList')
}
