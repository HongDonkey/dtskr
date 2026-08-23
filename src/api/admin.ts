export type AdminAuthResult = {
  authenticated: boolean
  passwordChangeRequired?: boolean
  message?: string
}

export type RequestStatus = 'PENDING' | 'REVIEWING' | 'COMPLETED'

type CsrfTokenResult = {
  token: string
  headerName: string
}

async function getCsrfHeaders(): Promise<Record<string, string>> {
  const response = await fetch('/api/admin/auth/csrf', {
    credentials: 'include',
    cache: 'no-store',
  })
  if (!response.ok) throw new Error('Failed to initialize administrator security.')
  const csrf = (await response.json()) as CsrfTokenResult
  return { [csrf.headerName]: csrf.token }
}

export async function loginAdmin(loginId: string, password: string): Promise<AdminAuthResult> {
  const csrfHeaders = await getCsrfHeaders()
  const response = await fetch('/api/admin/auth/login', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...csrfHeaders },
    body: JSON.stringify({ loginId, password }),
  })
  const result = (await response.json()) as AdminAuthResult
  if (!response.ok) throw new Error(result.message ?? 'Admin login failed.')
  return result
}

export async function getAdminAuthStatus(): Promise<AdminAuthResult> {
  const response = await fetch('/api/admin/auth/status', { credentials: 'include', cache: 'no-store' })
  if (!response.ok) throw new Error('Failed to check administrator authentication.')
  return (await response.json()) as AdminAuthResult
}

export type AdminRequestSummary = {
  id: number
  category: RequestCategory
  title: string
  content: string
  requesterName: string | null
  requesterIp: string | null
  status: RequestStatus
  adminResponse: string | null
  respondedAt: string | null
  respondedBy: string | null
  languageCode: string
  createdAt: string
  attachmentCount: number
  attachments: AdminAttachmentSummary[]
}

export type AdminAttachmentSummary = {
  id: number
  originalFileName: string
  contentType: string
  fileSize: number
}

export type TodayStatistics = {
  date: string
  uniqueVisitors: number
}

export async function getTodayStatistics(): Promise<TodayStatistics> {
  const response = await fetch('/api/admin/statistics/today', { credentials: 'include', cache: 'no-store' })
  if (!response.ok) throw new Error('Failed to load today statistics.')
  return (await response.json()) as TodayStatistics
}

export async function getAdminRequests(): Promise<AdminRequestSummary[]> {
  const response = await fetch('/api/admin/requests', { credentials: 'include', cache: 'no-store' })
  if (!response.ok) throw new Error('Failed to load requests.')
  return (await response.json()) as AdminRequestSummary[]
}

export async function updateAdminRequestStatus(id: number, status: RequestStatus): Promise<RequestStatus> {
  const csrfHeaders = await getCsrfHeaders()
  const response = await fetch(`/api/admin/requests/${id}/status`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...csrfHeaders },
    body: JSON.stringify({ status }),
  })
  const result = (await response.json()) as { status?: RequestStatus; message?: string }
  if (!response.ok || !result.status) throw new Error(result.message ?? 'Failed to update request status.')
  return result.status
}

export type AdminResponseResult = {
  response: string
  respondedAt: string
  respondedBy: string
}

export async function updateAdminRequestResponse(id: number, responseText: string): Promise<AdminResponseResult> {
  const csrfHeaders = await getCsrfHeaders()
  const response = await fetch(`/api/admin/requests/${id}/response`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...csrfHeaders },
    body: JSON.stringify({ response: responseText }),
  })
  const result = (await response.json()) as Partial<AdminResponseResult> & { message?: string }
  if (!response.ok || !result.response || !result.respondedAt || !result.respondedBy) {
    throw new Error(result.message ?? 'Failed to save the administrator response.')
  }
  return result as AdminResponseResult
}

export async function changeAdminPassword(currentPassword: string, newPassword: string): Promise<void> {
  const csrfHeaders = await getCsrfHeaders()
  const response = await fetch('/api/admin/auth/password', {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...csrfHeaders },
    body: JSON.stringify({ currentPassword, newPassword }),
  })
  const result = (await response.json()) as { changed?: boolean; message?: string }
  if (!response.ok || !result.changed) throw new Error(result.message ?? 'Failed to change password.')
}

export async function logoutAdmin(): Promise<void> {
  const csrfHeaders = await getCsrfHeaders()
  const response = await fetch('/api/admin/auth/logout', {
    method: 'POST',
    credentials: 'include',
    headers: csrfHeaders,
  })
  if (!response.ok) throw new Error('Failed to sign out.')
}
import type { RequestCategory } from './requestBoard'
