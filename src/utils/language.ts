import type { Language } from '../types/layout'

export const languageToLocale: Record<Language, 'ko' | 'en' | 'jp'> = {
  KR: 'ko',
  EN: 'en',
  JP: 'jp',
}

export const languageToSearchLocale: Record<Language, 'ko' | 'en' | 'jp'> = {
  KR: 'ko',
  EN: 'en',
  JP: 'jp',
}

export const languageToSeoLocale: Record<Language, 'ko' | 'en' | 'ja'> = {
  KR: 'ko',
  EN: 'en',
  JP: 'ja',
}

export const searchLocaleToLanguage = (locale: string | null): Language | null => {
  if (locale === 'ko') return 'KR'
  if (locale === 'en') return 'EN'
  if (locale === 'ja' || locale === 'jp') return 'JP'
  return null
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
