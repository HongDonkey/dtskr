import { Box, Button, Typography } from '@mui/material'
import { Link as RouterLink, useOutletContext } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageMetadata } from '../components/PageMetadata'
import { patchNotes } from '../content/patchNotes'
import type { AppOutletContext } from '../types/layout'
import { languageToLocale } from '../utils/language'

export function PatchNotesPage() {
  const { t } = useTranslation('main')
  const { language } = useOutletContext<AppOutletContext>()
  const locale = languageToLocale[language]

  return (
    <Box component="main" className="patch-notes-page">
      <PageMetadata language={language} title={t('patchNotes.seoTitle')} description={t('patchNotes.seoDescription')} />
      <Box className="patch-notes-grid" />
      <Box className="patch-notes-shell">
        <Button component={RouterLink} to="/" className="patch-notes-back">&larr; {t('patchNotes.back')}</Button>
        <Box component="header" className="patch-notes-header">
          <Typography component="p">UPDATE LOG / DIGIVOLUTION</Typography>
          <Typography component="h1">{t('patchNotes.title')}</Typography>
          <Typography component="p">{t('patchNotes.description')}</Typography>
        </Box>

        <Box className="patch-notes-list">
          {patchNotes.map((note, noteIndex) => {
            const content = note.content[locale]
            return (
              <Box component="article" className="patch-note-card" key={note.version}>
                <Box className="patch-note-meta">
                  {noteIndex === 0 && <Typography component="span">{t('patchNotes.latest')}</Typography>}
                  <Typography component="strong">{note.version}</Typography>
                </Box>
                <Box className="patch-note-content">
                  <Typography component="h2">{content.title}</Typography>
                  {content.summary && <Typography component="p" className="patch-note-summary">{content.summary}</Typography>}
                  {content.sections.map((section) => (
                    <Box component="section" className={`patch-note-section ${section.type}`} key={section.type}>
                      <Typography component="h3">{t(`patchNotes.sections.${section.type}`)}</Typography>
                      <Box component="ul">
                        {section.items.map((item) => <Typography component="li" key={item}>{item}</Typography>)}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            )
          })}
        </Box>
      </Box>
    </Box>
  )
}
