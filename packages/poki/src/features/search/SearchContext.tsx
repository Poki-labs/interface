import { TokenOptionSection } from 'poki/src/components/TokenSelector/types'

export interface SearchContext {
  category?: TokenOptionSection
  query?: string
  position?: number
  suggestionCount?: number
  isHistory?: boolean // history item click
}
