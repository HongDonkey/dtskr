import { Box, Button, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

export function PrivacyPolicyPage() {
  const { t } = useTranslation('main')
  const navigate = useNavigate()

  return (
    <Box component="main" className="request-board-page privacy-policy-page">
      <Box className="request-board-grid" />
      <Box className="request-board-shell">
        <Button className="request-board-back" onClick={() => navigate(-1)}>&larr; {t('privacy.back')}</Button>
        <Box component="article" className="request-board-panel privacy-policy-panel">
          <Box className="request-board-heading">
            <Typography component="p">PRIVACY / POLICY</Typography>
            <Typography component="h1">{t('privacy.title')}</Typography>
            <Typography component="p">{t('privacy.effectiveDate')}</Typography>
          </Box>

          <section><Typography component="h2">{t('privacy.purposeTitle')}</Typography><Typography>{t('privacy.purpose')}</Typography></section>
          <section><Typography component="h2">{t('privacy.itemsTitle')}</Typography><Typography component="p">{t('privacy.itemsRequired')}</Typography><Typography component="p">{t('privacy.itemsAutomatic')}</Typography><Typography component="p">{t('privacy.itemsOptional')}</Typography></section>
          <section><Typography component="h2">{t('privacy.retentionTitle')}</Typography><Typography component="p">{t('privacy.retentionPosts')}</Typography><Typography component="p">{t('privacy.retentionIp')}</Typography><Typography component="p">{t('privacy.visitorStatistics')}</Typography></section>
          <section><Typography component="h2">{t('privacy.sharingTitle')}</Typography><Typography>{t('privacy.sharing')}</Typography></section>
          <section><Typography component="h2">{t('privacy.destructionTitle')}</Typography><Typography>{t('privacy.destruction')}</Typography></section>
          <section><Typography component="h2">{t('privacy.rightsTitle')}</Typography><Typography>{t('privacy.rights')}</Typography></section>
          <section><Typography component="h2">{t('privacy.securityTitle')}</Typography><Typography>{t('privacy.security')}</Typography></section>
          <section><Typography component="h2">{t('privacy.contactTitle')}</Typography><Typography>{t('privacy.contact')}</Typography></section>
        </Box>
      </Box>
    </Box>
  )
}
