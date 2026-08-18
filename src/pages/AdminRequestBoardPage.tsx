import { Box, Button, CircularProgress, Typography } from '@mui/material'
import { type FormEvent, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { changeAdminPassword, getAdminAuthStatus, getAdminRequests, logoutAdmin, updateAdminRequestResponse, updateAdminRequestStatus, type AdminRequestSummary, type RequestStatus } from '../api/admin'
import { AdminRequestTable } from '../components/requestBoard/AdminRequestTable'

export function AdminRequestBoardPage() {
  const { t } = useTranslation('main')
  const navigate = useNavigate()
  const [authenticated, setAuthenticated] = useState(false)
  const [passwordChangeRequired, setPasswordChangeRequired] = useState(false)
  const [requests, setRequests] = useState<AdminRequestSummary[]>([])
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [updatingRequestId, setUpdatingRequestId] = useState<number | null>(null)
  const [responseDrafts, setResponseDrafts] = useState<Record<number, string>>({})

  useEffect(() => {
    void getAdminAuthStatus()
      .then((result) => {
        if (!result.authenticated) navigate('/admin/login', { replace: true })
        else {
          setAuthenticated(true)
          setPasswordChangeRequired(Boolean(result.passwordChangeRequired))
          setShowPasswordForm(Boolean(result.passwordChangeRequired))
          if (result.passwordChangeRequired) return
          return getAdminRequests().then((loaded) => {
            setRequests(loaded)
            setResponseDrafts(Object.fromEntries(loaded.map((request) => [request.id, request.adminResponse ?? ''])))
          })
        }
      })
      .catch(() => navigate('/admin/login', { replace: true }))
  }, [navigate])

  if (!authenticated) {
    return <Box className="admin-login-page"><CircularProgress aria-label={t('admin.authenticating')} /></Box>
  }

  const submitPassword = async (event: FormEvent) => {
    event.preventDefault()
    setPasswordMessage('')
    try {
      await changeAdminPassword(currentPassword, newPassword)
      setCurrentPassword('')
      setNewPassword('')
      navigate('/admin/login', { replace: true, state: { passwordChanged: true } })
    } catch (cause) {
      setPasswordMessage(cause instanceof Error ? cause.message : t('admin.passwordChangeFailed'))
    }
  }

  const changeRequestStatus = async (requestId: number, status: RequestStatus) => {
    setUpdatingRequestId(requestId)
    setStatusMessage('')
    try {
      const updatedStatus = await updateAdminRequestStatus(requestId, status)
      setRequests((current) => current.map((request) => request.id === requestId
        ? { ...request, status: updatedStatus }
        : request))
    } catch {
      setStatusMessage(t('admin.statusChangeFailed'))
    } finally {
      setUpdatingRequestId(null)
    }
  }

  const saveResponse = async (requestId: number) => {
    const responseText = responseDrafts[requestId]?.trim() ?? ''
    if (!responseText) {
      setStatusMessage(t('admin.responseRequired'))
      return
    }
    setUpdatingRequestId(requestId)
    setStatusMessage('')
    try {
      const saved = await updateAdminRequestResponse(requestId, responseText)
      setRequests((current) => current.map((request) => request.id === requestId
        ? { ...request, adminResponse: saved.response, respondedAt: saved.respondedAt, respondedBy: saved.respondedBy }
        : request))
      setStatusMessage(t('admin.responseSaved'))
    } catch {
      setStatusMessage(t('admin.responseSaveFailed'))
    } finally {
      setUpdatingRequestId(null)
    }
  }

  return (
    <Box component="main" className="request-board-page">
      <Box className="request-board-grid" />
      <Box className="request-board-shell">
        <Button className="request-board-back" onClick={() => navigate('/')}>&larr; {t('board.back')}</Button>
        <Box component="section" className="request-board-panel">
          <Box className="request-board-heading">
            <Typography component="p">ADMIN / REQUESTS</Typography>
            <Typography component="h1">{t('admin.requestsTitle')}</Typography>
            <Typography component="p">{t('admin.requestsDescription')}</Typography>
            <Box className="request-board-actions">
              <Button className="request-write-toggle" onClick={() => setShowPasswordForm((current) => passwordChangeRequired || !current)}>{t('admin.changePassword')}</Button>
              <Button className="request-write-toggle" onClick={() => void logoutAdmin().finally(() => navigate('/admin/login', { replace: true }))}>{t('admin.logout')}</Button>
            </Box>
          </Box>
          {passwordChangeRequired && <Typography className="request-form-message error" role="alert">{t('admin.passwordChangeRequired')}</Typography>}
          {showPasswordForm && <Box component="form" className="admin-password-form" onSubmit={submitPassword}><label className="request-native-field"><span>{t('admin.currentPassword')}</span><input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required /></label><label className="request-native-field"><span>{t('admin.newPassword')}</span><input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} minLength={8} maxLength={72} required /></label><Button type="submit">{t('admin.savePassword')}</Button></Box>}
          {passwordMessage && <Typography className="request-form-message">{passwordMessage}</Typography>}
          {statusMessage && <Typography className="request-form-message error" role="alert">{statusMessage}</Typography>}
          {!passwordChangeRequired && <AdminRequestTable requests={requests} updatingRequestId={updatingRequestId} responseDrafts={responseDrafts} onStatusChange={(id, status) => void changeRequestStatus(id, status)} onResponseChange={(id, response) => setResponseDrafts((current) => ({ ...current, [id]: response }))} onResponseSave={(id) => void saveResponse(id)} />}
        </Box>
      </Box>
    </Box>
  )
}
