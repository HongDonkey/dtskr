import type { RequestCategory } from '../api/requestBoard'

const categoryTranslationKeys: Record<RequestCategory, string> = {
  DATA_CORRECTION: 'dataCorrection',
  FEATURE: 'feature',
  BUG: 'bug',
  ETC: 'etc',
}

export const requestCategoryKey = (category: RequestCategory) =>
  `board.categories.${categoryTranslationKeys[category]}`
