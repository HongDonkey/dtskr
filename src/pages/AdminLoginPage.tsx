import { Box, Button, TextField, Typography } from '@mui/material'
import { FormEvent, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import { loginAdmin } from '../api/admin'

export function AdminLoginPage() {
  const { t } = useTranslation('main')
  const navigate = useNavigate()
  const location = useLocation()
  const passwordChanged = Boolean((location.state as { passwordChanged?: boolean } | null)?.passwordChanged)
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await loginAdmin(loginId, password)
      navigate('/admin/requests', { replace: true })
    } catch (cause) {
      setError(cause instanceof Error && cause.message.includes('configured')
        ? t('admin.notConfigured')
        : t('admin.invalidPassword'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box component="main" className="admin-login-page">
      <Box className="request-board-grid" />
      <Box component="form" className="admin-login-card" onSubmit={submit}>
        <Typography component="p" className="admin-login-eyebrow">ADMIN ACCESS / RESTRICTED</Typography>
        <Typography component="h1">{t('admin.title')}</Typography>
        <Typography component="p" className="admin-login-description">{t('admin.description')}</Typography>
        {passwordChanged && <Typography className="request-form-message success" role="status">{t('admin.passwordChanged')}</Typography>}
        <TextField
          type="text"
          value={loginId}
          onChange={(event) => setLoginId(event.target.value)}
          label={t('admin.loginId')}
          autoComplete="username"
          autoFocus
          required
          fullWidth
        />
        <TextField
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          label={t('admin.password')}
          autoComplete="current-password"
          required
          fullWidth
        />
        {error && <Typography className="admin-login-error" role="alert">{error}</Typography>}
        <Box className="admin-login-actions">
          <Button type="button" onClick={() => navigate('/')}>{t('admin.cancel')}</Button>
          <Button type="submit" disabled={submitting}>{submitting ? t('admin.authenticating') : t('admin.login')}</Button>
        </Box>
      </Box>
    </Box>
  )
}
