import { useEffect, useState } from 'react'
import { AppBar, Box, Button, Link, Stack, Toolbar, Typography } from '@mui/material'
import { Link as RouterLink, Outlet, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import './App.css'
import type { AppOutletContext, Language } from './types/layout'
import { languageToLocale, localeToLanguage } from './utils/language'
import { recordVisit } from './api/visitor'

const referenceUrlByLanguage: Record<Language, string> = {
  KR: 'https://digimon.net/reference_ko/',
  EN: 'https://digimon.net/reference_en/',
  JP: 'https://digimon.net/reference/',
}

function App() {
  const { t, i18n } = useTranslation('main')
  const location = useLocation()
  const isHome = location.pathname === '/'
  const isRequestBoard = location.pathname === '/requests'
  const [language, setLanguage] = useState<Language>(() => localeToLanguage(i18n.language))

  useEffect(() => {
    if (location.pathname.startsWith('/admin')) return
    const visitKey = `visit-recorded:${new Intl.DateTimeFormat('en-CA').format(new Date())}`
    if (window.sessionStorage.getItem(visitKey)) return
    void recordVisit()
      .then(() => window.sessionStorage.setItem(visitKey, 'true'))
      .catch(() => undefined)
  }, [location.pathname])

  const selectLanguage = (next: Language) => {
    setLanguage(next)
    window.localStorage.setItem('language', next)
    void i18n.changeLanguage(languageToLocale[next])
  }

  const scrollTo = (id: 'planner' | 'dex') => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  const outletContext: AppOutletContext = { language }

  return (
    <Box component="main" className="app-shell">
      <AppBar component="header" position="sticky" elevation={0} className="topbar"><Toolbar disableGutters>
        <Link className="brand" component={RouterLink} to="/" underline="none"><Box component="span" className="brand-mark">◇</Box>DIGIVOLUTION <Typography component="small">{language}</Typography></Link>
        <Stack component="nav" direction="row" spacing={3.75}><Link className={isHome ? 'active' : undefined} href="/#planner" underline="none">{t('nav.planner')}</Link><Link href={referenceUrlByLanguage[language]} target="_blank" rel="noreferrer" underline="none" onClick={(event) => event.currentTarget.blur()}>{t('nav.dex')}</Link><Link component={RouterLink} className={isRequestBoard ? 'active' : undefined} to="/requests" underline="none">{t('nav.guide')}</Link></Stack>
        <Box className="language-switcher" role="group" aria-label={t('nav.language')}>{(['KR', 'EN', 'JP'] as const).map((item) => <Button key={item} className={`language-button ${language === item ? 'active' : ''}`} onClick={() => selectLanguage(item)} aria-pressed={language === item}>{item}</Button>)}</Box>
      </Toolbar></AppBar>

      {isHome && <Box component="nav" className="section-nav" aria-label={t('nav.navigator')}><Typography component="p" className="section-nav-title" style={{ textAlign: 'center' }}>{t('nav.navigator')}</Typography><Button onClick={() => scrollTo('planner')}><Box component="span">01</Box>{t('nav.search')}</Button><Button onClick={() => scrollTo('dex')}><Box component="span">02</Box>{t('nav.route')}</Button></Box>}

      <Outlet context={outletContext} />
      <Box component="footer">© 2026 DIGIVICE LAB <Box component="span">FAN MADE EVOLUTION PLANNER</Box><Link component={RouterLink} to="/privacy" underline="hover">{t('privacy.footerLink')}</Link></Box>
    </Box>
  )
}

export default App
