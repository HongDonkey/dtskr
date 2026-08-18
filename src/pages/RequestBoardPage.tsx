import { Box, Button, Typography } from '@mui/material'
import { type ChangeEvent, type FormEvent, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { createRequestPost, getMyRequestPosts, RequestRateLimitError, type RequestCategory, type RequesterPost } from '../api/requestBoard'
import type { DigimonSummary } from '../types/digimon'
import { RelatedDigimonSearch } from '../components/requestBoard/RelatedDigimonSearch'
import { RequesterPostList } from '../components/requestBoard/RequesterPostList'

export function RequestBoardPage() {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation('main')
  const [writing, setWriting] = useState(false)
  const [lookingUp, setLookingUp] = useState(false)
  const [category, setCategory] = useState<RequestCategory>('DATA_CORRECTION')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [requesterName, setRequesterName] = useState('')
  const [requesterPassword, setRequesterPassword] = useState('')
  const [lookupName, setLookupName] = useState('')
  const [lookupPassword, setLookupPassword] = useState('')
  const [myPosts, setMyPosts] = useState<RequesterPost[] | null>(null)
  const [images, setImages] = useState<File[]>([])
  const [digimonQuery, setDigimonQuery] = useState('')
  const [relatedDigimon, setRelatedDigimon] = useState<DigimonSummary | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const selectImages = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? [])
    if (selected.length > 5) {
      setMessage({ type: 'error', text: t('board.fileCountError') })
      event.target.value = ''
      return
    }
    setImages(selected)
    setMessage(null)
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    setMessage(null)
    try {
      const result = await createRequestPost({
        category, title, content, requesterName, requesterPassword,
        languageCode: i18n.language.startsWith('en') ? 'en' : 'ko',
        relatedDigimonId: relatedDigimon?.id,
        images,
      })
      setTitle('')
      setContent('')
      setRequesterName('')
      setRequesterPassword('')
      setImages([])
      setDigimonQuery('')
      setRelatedDigimon(null)
      setWriting(false)
      setMessage({ type: 'success', text: t('board.submitSuccess', { id: result.id }) })
    } catch (cause) {
      if (cause instanceof RequestRateLimitError) {
        setMessage({ type: 'error', text: t('board.rateLimited', { minutes: Math.ceil(cause.retryAfterSeconds / 60) }) })
        return
      }
      const detail = cause instanceof Error ? cause.message : ''
      setMessage({ type: 'error', text: detail ? `${t('board.submitError')} (${detail})` : t('board.submitError') })
    } finally {
      setSubmitting(false)
    }
  }

  const lookupMyPosts = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    setMessage(null)
    try {
      setMyPosts(await getMyRequestPosts(lookupName, lookupPassword))
    } catch (cause) {
      if (cause instanceof RequestRateLimitError) {
        setMessage({ type: 'error', text: t('board.rateLimited', { minutes: Math.ceil(cause.retryAfterSeconds / 60) }) })
        return
      }
      const detail = cause instanceof Error ? cause.message : ''
      setMessage({ type: 'error', text: detail ? `${t('board.lookupError')} (${detail})` : t('board.lookupError') })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box component="main" className="request-board-page">
      <Box className="request-board-grid" />
      <Box className="request-board-shell">
        <Button className="request-board-back" onClick={() => navigate('/')}>
          &larr; {t('board.back')}
        </Button>

        <Box component="section" className="request-board-panel">
          <Box className="request-board-heading">
            <Typography component="p">{t('board.eyebrow')}</Typography>
            <Typography component="h1">{t('board.title')}</Typography>
            <Typography component="p">{t('board.description')}</Typography>
            <Box className="request-board-actions">
              <Button className="request-write-toggle" onClick={() => { setWriting((current) => !current); setLookingUp(false); setMessage(null) }}>{writing ? t('board.cancelWrite') : t('board.write')}</Button>
              <Button className="request-write-toggle" onClick={() => { setLookingUp((current) => !current); setWriting(false); setMessage(null) }}>{lookingUp ? t('board.cancelLookup') : t('board.myPosts')}</Button>
            </Box>
          </Box>

          {writing && (
            <Box component="form" className="request-write-form" onSubmit={submit}>
              <label className="request-native-field request-category-field"><span>{t('board.category')} *</span><select value={category} onChange={(event) => setCategory(event.target.value as RequestCategory)} required><option value="DATA_CORRECTION">{t('board.categories.dataCorrection')}</option><option value="FEATURE">{t('board.categories.feature')}</option><option value="BUG">{t('board.categories.bug')}</option><option value="ETC">{t('board.categories.etc')}</option></select></label>
              <Box className="request-credentials">
                <label className="request-native-field"><span>{t('board.writer')} *</span><input value={requesterName} onChange={(event) => setRequesterName(event.target.value)} maxLength={50} required /></label>
                <label className="request-native-field"><span>{t('board.postPassword')} *</span><input type="password" value={requesterPassword} onChange={(event) => setRequesterPassword(event.target.value)} minLength={4} maxLength={72} autoComplete="new-password" required /></label>
              </Box>
              <RelatedDigimonSearch query={digimonQuery} selected={relatedDigimon} onQueryChange={(query) => { setRelatedDigimon(null); setDigimonQuery(query) }} onSelect={(digimon) => { setRelatedDigimon(digimon); setDigimonQuery(digimon.name) }} onClear={() => { setRelatedDigimon(null); setDigimonQuery('') }} />
              <label className="request-native-field request-write-title"><span>{t('board.subject')} *</span><input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={200} required /></label>
              <label className="request-native-field request-write-content"><span>{t('board.content')} *</span><textarea value={content} onChange={(event) => setContent(event.target.value)} maxLength={10000} rows={8} required /></label>
              <Box className="request-file-field">
                <Button component="label">
                  {t('board.selectImages')}
                  <input hidden type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={selectImages} />
                </Button>
                <Typography component="span">{t('board.fileHelp')}</Typography>
                {images.length > 0 && <Box className="request-file-list">{images.map((image) => <Typography key={`${image.name}-${image.lastModified}`}>{image.name}</Typography>)}</Box>}
              </Box>
              <Typography className="request-privacy-notice">{t('board.privacyNotice')} <Button component={RouterLink} to="/privacy">{t('board.viewPrivacyPolicy')}</Button></Typography>
              <Button className="request-submit" type="submit" disabled={submitting}>{submitting ? t('board.submitting') : t('board.submit')}</Button>
            </Box>
          )}

          {lookingUp && (
            <Box component="form" className="request-lookup-form" onSubmit={lookupMyPosts}>
              <label className="request-native-field"><span>{t('board.writer')} *</span><input value={lookupName} onChange={(event) => setLookupName(event.target.value)} maxLength={50} required /></label>
              <label className="request-native-field"><span>{t('board.postPassword')} *</span><input type="password" value={lookupPassword} onChange={(event) => setLookupPassword(event.target.value)} minLength={4} maxLength={72} autoComplete="current-password" required /></label>
              <Button type="submit" disabled={submitting}>{submitting ? t('board.lookingUp') : t('board.lookup')}</Button>
            </Box>
          )}

          {message && <Typography className={`request-form-message ${message.type}`} role="status">{message.text}</Typography>}

          {myPosts !== null && lookingUp && <RequesterPostList posts={myPosts} />}

          <Box className="request-board-table" role="table" aria-label={t('board.title')}>
            <Box className="request-board-table-head" role="row">
              <Typography role="columnheader">{t('board.number')}</Typography>
              <Typography role="columnheader">{t('board.subject')}</Typography>
              <Typography role="columnheader">{t('board.status')}</Typography>
              <Typography role="columnheader">{t('board.date')}</Typography>
            </Box>
            <Box className="request-board-notice" role="row">
              <Typography role="cell">NOTICE</Typography>
              <Box role="cell">
                <Typography component="strong">{t('board.noticeTitle')}</Typography>
                <Typography component="span">{t('board.noticeDescription')}</Typography>
              </Box>
              <Typography role="cell">{t('board.notice')}</Typography>
              <Typography role="cell">2026.08.17</Typography>
            </Box>
            <Typography className="request-board-empty">{t('board.empty')}</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
