import { Box, Button, Typography } from '@mui/material'
import { Link as RouterLink, useOutletContext } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageMetadata } from '../components/PageMetadata'
import type { AppOutletContext } from '../types/layout'

const sectionKeys = ['purpose', 'features', 'information', 'contentPolicy', 'copyright', 'contact'] as const

export function AboutPage() {
  const { t } = useTranslation('main')
  const { language } = useOutletContext<AppOutletContext>()

  return (
    <Box component="main" className="about-page">
      <PageMetadata language={language} title={t('about.seoTitle')} description={t('about.seoDescription')} />
      <Box className="about-grid" />
      <Box className="about-shell">
        <Button component={RouterLink} to="/" className="about-back">&larr; {t('about.back')}</Button>
        <Box component="article" className="about-panel">
          <Box component="header" className="about-heading">
            <Typography component="p">ABOUT / DIGIVOLUTION</Typography>
            <Typography component="h1">{t('about.title')}</Typography>
            <Typography component="p">{t('about.description')}</Typography>
          </Box>

          <Box className="about-sections">
            {sectionKeys.map((key, index) => (
              <Box component="section" className="about-section" key={key}>
                <Typography component="span">{String(index + 1).padStart(2, '0')}</Typography>
                <Box>
                  <Typography component="h2">{t(`about.sections.${key}.title`)}</Typography>
                  <Typography component="p">{t(`about.sections.${key}.body`)}</Typography>
                  {key === 'contact' && (
                    <Button component={RouterLink} to="/requests" className="about-contact-link">
                      {t('about.sections.contact.link')} &rarr;
                    </Button>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
