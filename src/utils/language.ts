import type { Language } from '../types/layout'

export const languageToLocale: Record<Language, 'ko' | 'en' | 'jp'> = {
  KR: 'ko',
  EN: 'en',
  JP: 'jp',
}

export const localeToLanguage = (locale: string): Language => {
  if (locale.startsWith('en')) return 'EN'
  if (locale.startsWith('jp')) return 'JP'
  return 'KR'
}

export const catalogAllLabel = (locale: string) => {
  if (locale.startsWith('en')) return 'All'
  if (locale.startsWith('jp')) return 'すべて'
  return '전체'
}
