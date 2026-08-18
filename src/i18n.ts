import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import koMain from './locales/ko/main.json'
import koSearch from './locales/ko/search.json'
import koEvolution from './locales/ko/evolution.json'
import enMain from './locales/en/main.json'
import enSearch from './locales/en/search.json'
import enEvolution from './locales/en/evolution.json'
import jpMain from './locales/jp/main.json'
import jpSearch from './locales/jp/search.json'
import jpEvolution from './locales/jp/evolution.json'

const resources = {
  ko: { main: koMain, search: koSearch, evolution: koEvolution },
  en: { main: enMain, search: enSearch, evolution: enEvolution },
  jp: { main: jpMain, search: jpSearch, evolution: jpEvolution },
} as const

const savedLanguage = window.localStorage.getItem('language')

void i18n.use(initReactI18next).init({
  resources,
  lng: savedLanguage === 'EN' ? 'en' : 'ko',
  fallbackLng: 'ko',
  ns: ['main', 'search', 'evolution'],
  defaultNS: 'main',
  interpolation: { escapeValue: false },
})

export default i18n
