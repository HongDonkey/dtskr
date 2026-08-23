import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Box, Button, Link, Typography } from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getDigimonDetail } from '../api/digimon'
import '../App.css'
import { PageMetadata } from '../components/PageMetadata'
import { localeToLanguage } from '../utils/language'

export function DigimonDetailPage() {
  const { t, i18n } = useTranslation('main')
  const [isSkillImageOpen, setIsSkillImageOpen] = useState(false)
  const navigate = useNavigate()
  const digimonId = Number(useParams().id)
  const { data, isLoading, isError } = useQuery({ queryKey: ['digimon-detail', i18n.language, digimonId], queryFn: () => getDigimonDetail(digimonId), enabled: Number.isInteger(digimonId) && digimonId > 0 })
  const evolutionConditions = data
    ? (data.evolutionCondition ?? '').split(',').map((condition) => condition.trim()).filter(Boolean)
    : []
  const language = localeToLanguage(i18n.language)
  const pageTitle = data ? t('seo.detailTitle', { name: data.name }) : t('seo.detailLoadingTitle')
  const pageDescription = data
    ? t('seo.detailDescription', {
        name: data.name,
        stage: data.stage,
        type: data.digimonType,
        condition: data.evolutionCondition || t('detail.noCondition'),
      })
    : t('seo.homeDescription')
  const structuredData = useMemo(() => data ? {
    '@context': 'https://schema.org',
    '@type': 'Thing',
    name: data.name,
    description: pageDescription,
    image: data.imageUrl || data.pixelImageUrl || undefined,
    url: window.location.href,
    additionalProperty: [
      { '@type': 'PropertyValue', name: t('detail.stage'), value: data.stage },
      { '@type': 'PropertyValue', name: t('detail.attribute'), value: data.attribute },
      { '@type': 'PropertyValue', name: t('detail.type'), value: data.digimonType },
    ],
  } : null, [data, pageDescription, t])

  return <Box component="main" className="detail-page"><PageMetadata language={language} title={pageTitle} description={pageDescription} imageUrl={data?.imageUrl ?? data?.pixelImageUrl} noIndex={isError || (!data && !isLoading)} structuredData={structuredData} /><Box className="detail-grid" /><Box className="detail-shell">
    <Button className="detail-back" onClick={() => navigate(-1)}><Box component="span" aria-hidden="true">←</Box> {t('detail.back')}</Button>
    {isLoading && <Typography className="detail-message">{t('detail.loading')}</Typography>}
    {(isError || (!data && !isLoading)) && <Typography className="detail-message">{t('detail.error')}</Typography>}
    {data && <Box component="article" className="detail-card">
      <Box className="detail-left-column"><Box className="detail-identity"><Box className="detail-sprite-frame">{data.imageUrl || data.pixelImageUrl ? <Box component="img" src={data.imageUrl ?? data.pixelImageUrl!} alt={data.name} /> : <Box className="detail-fallback">{data.name.slice(0, 1)}</Box>}</Box><Box className="detail-nameplate"><Typography component="small">DIGIMON / {String(data.id).padStart(3, '0')}</Typography><Typography component="h1">{data.name}</Typography></Box></Box>
        <Box className="detail-game-capture">{data.gameCaptureUrl ? <Box component="img" src={data.gameCaptureUrl} alt={t('detail.captureAlt', { name: data.name })} /> : <><Box className="detail-capture-grid" /><Typography component="small">IN-GAME CAPTURE</Typography><Typography component="strong">{t('detail.capturePending')}</Typography><Typography component="p">{t('detail.captureDescription')}</Typography></>}</Box>
        {data.gameCaptureUrl && <Typography component="p" className="detail-image-source">{t('detail.imageSource')} <Link href="https://toyagumon.tistory.com/entry/timestranger-digimons-list" target="_blank" rel="noreferrer" underline="hover">toyagumon.tistory.com <Box component="span" aria-hidden="true">↗</Box></Link></Typography>}
        <Typography component="h2" className="detail-facts-title">{t('detail.facts')}</Typography>
        <Box component="dl" className="detail-facts">{[[t('detail.name'), data.name], [t('detail.stage'), data.stage], [t('detail.attribute'), data.attribute], [t('detail.type'), data.digimonType], [t('detail.personality'), data.personality]].map(([label, value]) => <Box key={label} className="detail-fact-row"><Typography component="dt">{label}</Typography><Typography component="dd">{value || '-'}</Typography></Box>)}</Box>
      </Box>
      <Box className="detail-content"><Typography component="p" className="detail-eyebrow">DIGIMON PROFILE</Typography>
        <Box className="detail-skills-section"><Typography component="h2">{t('detail.specialSkills')}</Typography><Box className="detail-skill-list">{data.specialSkills.map((skill, index) => <Box className="detail-skill-item" key={`${skill.name}-${index}`}><Typography component="strong">{skill.name}</Typography>{skill.details && <Typography component="small">{skill.details}</Typography>}{skill.effect && <Typography component="p">{skill.effect}</Typography>}</Box>)}</Box>{data.skillImageUrl && <><Button className="detail-skill-toggle" onClick={() => setIsSkillImageOpen((open) => !open)} aria-expanded={isSkillImageOpen}>{isSkillImageOpen ? '−' : '+'} {t(isSkillImageOpen ? 'detail.hideSkillImage' : 'detail.showSkillImage')}</Button>{isSkillImageOpen && <Box component="img" className="detail-skill-image" src={data.skillImageUrl} alt={t('detail.skillImageAlt', { name: data.name })} />}</>}</Box>
        <Box className="detail-skills-section"><Typography component="h2">{t('detail.attachmentSkills')}</Typography><Box className="detail-attachment-list">{data.attachmentSkills.length ? data.attachmentSkills.map((skill, index) => <Box className="detail-attachment-item" key={`${skill.name}-${index}`}><Typography component="small">{skill.requiredLevel == null ? 'LEVEL -' : `LV ${skill.requiredLevel}`}</Typography><Typography component="span">{skill.name}</Typography></Box>) : <Typography component="p" className="detail-skill-empty">{t('detail.noAttachmentSkills')}</Typography>}</Box></Box>
        <Box className="detail-section detail-condition"><Typography component="small">EVOLUTION REQUIREMENTS</Typography><Typography component="h2">{t('detail.condition')}</Typography>{evolutionConditions.length ? <Box component="ul" className="detail-condition-list">{evolutionConditions.map((condition, index) => <Typography component="li" key={`${condition}-${index}`}>{condition}</Typography>)}</Box> : <Typography component="p">{t('detail.noCondition')}</Typography>}</Box>
        {data.sourceUrl && <Link className="detail-source" href={data.sourceUrl} target="_blank" rel="noreferrer" underline="none">{t('detail.officialDex')} <Box component="span" aria-hidden="true">↗</Box></Link>}
      </Box>
    </Box>}
  </Box></Box>
}
