import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import koMain from './locales/ko/main.json'
import koSearch from './locales/ko/search.json'
import koEvolution from './locales/ko/evolution.json'
import koQuest from './locales/ko/quest.json'
import enMain from './locales/en/main.json'
import enSearch from './locales/en/search.json'
import enEvolution from './locales/en/evolution.json'
import enQuest from './locales/en/quest.json'
import jpMain from './locales/jp/main.json'
import jpSearch from './locales/jp/search.json'
import jpEvolution from './locales/jp/evolution.json'
import jpQuest from './locales/jp/quest.json'

const resources = {
  ko: { main: koMain, search: koSearch, evolution: koEvolution, quest: koQuest },
  en: { main: enMain, search: enSearch, evolution: enEvolution, quest: enQuest },
  jp: { main: jpMain, search: jpSearch, evolution: jpEvolution, quest: jpQuest },
} as const

const savedLanguage = window.localStorage.getItem('language')
const requestedLanguage = new URLSearchParams(window.location.search).get('lang')
const initialLanguage = requestedLanguage === 'en'
  ? 'en'
  : requestedLanguage === 'ja' || requestedLanguage === 'jp'
    ? 'jp'
    : requestedLanguage === 'ko'
      ? 'ko'
      : savedLanguage === 'EN'
        ? 'en'
        : savedLanguage === 'JP'
          ? 'jp'
          : 'ko'

void i18n.use(initReactI18next).init({
  resources,
  lng: initialLanguage,
  fallbackLng: 'ko',
  ns: ['main', 'search', 'evolution', 'quest'],
  defaultNS: 'main',
  interpolation: { escapeValue: false },
})

export default i18n
