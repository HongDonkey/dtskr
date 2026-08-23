import { Box, Button, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import type { AdminRequestSummary, RequestStatus } from '../../api/admin'
import { requestCategoryKey } from '../../utils/requestCategory'

type Props = {
  requests: AdminRequestSummary[]
  updatingRequestId: number | null
  responseDrafts: Record<number, string>
  onStatusChange: (requestId: number, status: RequestStatus) => void
  onResponseChange: (requestId: number, response: string) => void
  onResponseSave: (requestId: number) => void
}

export function AdminRequestTable({ requests, updatingRequestId, responseDrafts, onStatusChange, onResponseChange, onResponseSave }: Props) {
  const { t } = useTranslation('main')
  return <Box className="request-board-table" role="table" aria-label={t('admin.requestsTitle')}>
    <Box className="admin-request-table-head" role="row">
      <Typography role="columnheader">{t('board.number')}</Typography><Typography role="columnheader">{t('board.category')}</Typography><Typography role="columnheader">{t('board.subject')}</Typography><Typography role="columnheader">IP</Typography><Typography role="columnheader">{t('board.status')}</Typography><Typography role="columnheader">{t('board.date')}</Typography>
    </Box>
    {requests.map((request) => <Box className="admin-request-row" role="row" key={request.id}>
      <Typography role="cell" data-label={t('board.number')}>{request.id}</Typography>
      <Typography role="cell" data-label={t('board.category')}>{t(requestCategoryKey(request.category))}</Typography>
      <Box role="cell" className="admin-request-copy" data-label={t('board.subject')}>
        <Typography component="strong">{request.title}</Typography><Typography component="p">{request.content}</Typography>
        {request.attachments.length > 0 && <Box className="admin-request-attachments">{request.attachments.map((attachment) => <Box component="a" href={`/api/admin/requests/attachments/${attachment.id}`} target="_blank" rel="noreferrer" className="admin-attachment" key={attachment.id}><Box component="img" src={`/api/admin/requests/attachments/${attachment.id}`} alt={attachment.originalFileName} /><Typography component="span">{attachment.originalFileName}</Typography><Typography component="small">{(attachment.fileSize / 1024).toFixed(1)} KB</Typography></Box>)}</Box>}
        <Typography component="span">{request.requesterName || t('admin.anonymous')} · {t('admin.attachments', { count: request.attachmentCount })}</Typography>
        <Box className="admin-response-editor"><label><Typography component="span">{t('admin.response')}</Typography><textarea value={responseDrafts[request.id] ?? ''} onChange={(event) => onResponseChange(request.id, event.target.value)} maxLength={10000} rows={4} placeholder={t('admin.responsePlaceholder')} /></label><Box className="admin-response-actions">{request.respondedAt && <Typography component="small">{t('admin.respondedBy', { administrator: request.respondedBy, date: new Date(request.respondedAt).toLocaleString() })}</Typography>}<Button disabled={updatingRequestId === request.id} onClick={() => onResponseSave(request.id)}>{t('admin.saveResponse')}</Button></Box></Box>
      </Box>
      <Typography role="cell" className="admin-request-ip" data-label="IP">{request.requesterIp || '-'}</Typography>
      <Box role="cell" data-label={t('board.status')}><select className={`admin-status-select status-${request.status.toLowerCase()}`} value={request.status} disabled={updatingRequestId === request.id} onChange={(event) => onStatusChange(request.id, event.target.value as RequestStatus)} aria-label={t('admin.changeRequestStatus', { id: request.id })}><option value="PENDING">{t('board.statuses.PENDING')}</option><option value="REVIEWING">{t('board.statuses.REVIEWING')}</option><option value="COMPLETED">{t('board.statuses.COMPLETED')}</option></select></Box>
      <Typography role="cell" data-label={t('board.date')}>{new Date(request.createdAt).toLocaleDateString()}</Typography>
    </Box>)}
    {requests.length === 0 && <Typography className="request-board-empty">{t('admin.noRequests')}</Typography>}
  </Box>
}
