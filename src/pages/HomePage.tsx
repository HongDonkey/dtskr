import { useRef, useState } from 'react'
import { useQueries } from '@tanstack/react-query'
import { Box, Typography } from '@mui/material'
import Grid from '@mui/material/Grid'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getDigimonCounts, getEvolutionCount } from '../api/digimon'
import { EvolutionRouteSection } from '../components/EvolutionRouteSection'
import { SearchSection } from '../components/SearchSection'
import { SideRailAds } from '../components/SideRailAds'
import type { DigimonSummary } from '../types/digimon'
import type { AppOutletContext } from '../types/layout'
import { catalogAllLabel } from '../utils/language'

export function HomePage() {
  const { t, i18n } = useTranslation('main')
  const { language } = useOutletContext<AppOutletContext>()
  const navigate = useNavigate()
  const [selected, setSelected] = useState<DigimonSummary | null>(null)
  const adminClickCount = useRef(0)
  const adminClickTimer = useRef<number | null>(null)
  const [countsQuery, evolutionCountQuery] = useQueries({ queries: [
    { queryKey: ['digimon-counts', i18n.language], queryFn: getDigimonCounts },
    { queryKey: ['evolution-count', i18n.language], queryFn: getEvolutionCount },
  ] })
  const counts = countsQuery.data ?? {}

  const selectDigimon = (digimon: DigimonSummary) => {
    setSelected(digimon)
    window.requestAnimationFrame(() => document.getElementById('dex')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  const openAdminLogin = () => {
    adminClickCount.current += 1
    if (adminClickTimer.current !== null) window.clearTimeout(adminClickTimer.current)
    if (adminClickCount.current >= 5) {
      adminClickCount.current = 0
      navigate('/admin/login')
      return
    }
    adminClickTimer.current = window.setTimeout(() => { adminClickCount.current = 0 }, 2500)
  }

  return <>
    <Grid container component="section" className="hero" id="top" sx={{ alignItems: 'center' }}>
      <Box className="hero-grid" />
      <Grid size={{ xs: 12, md: 7 }} className="hero-copy"><Typography component="p" className="eyebrow">DIGIVOLUTION NAVIGATOR / 01</Typography><Typography component="h1">{t('hero.title1')}<br />{t('hero.title2')}<br /><Typography component="em">{t('hero.title3')}</Typography>{t('hero.title4')}</Typography><Typography component="p">{t('hero.description')}</Typography></Grid>
      <Grid size={{ xs: 12, md: 5 }} className="digital-core"><Box component="span" className="orbit one" aria-hidden="true" /><Box component="span" className="orbit two" aria-hidden="true" /><Box component="img" className="hero-digivice" src="/hero-digivice.png" alt="" aria-hidden="true" draggable={false} onClick={openAdminLogin} /></Grid>
    </Grid>

    <SideRailAds />
    <SearchSection selectedDigimon={selected} onSelect={selectDigimon} />
    <EvolutionRouteSection digimon={selected} />

    <Grid container component="section" className="stats" id="guide" sx={{ alignItems: 'center' }}>
      <Grid size={{ xs: 4, md: 3 }}><Typography component="span">DATA</Typography><Typography component="b">{counts[catalogAllLabel(i18n.language)] ?? '-'}</Typography><Typography component="small">{t('stats.registered')}</Typography></Grid>
      <Grid size={{ xs: 4, md: 3 }}><Typography component="span">ROUTE</Typography><Typography component="b">{evolutionCountQuery.data ?? '-'}</Typography><Typography component="small">{t('stats.routes')}</Typography></Grid>
      <Grid size={{ xs: 4, md: 3 }}><Typography component="span">LANG</Typography><Typography component="b">{language}</Typography><Typography component="small">{t('stats.interface')}</Typography></Grid>
    </Grid>
  </>
}
