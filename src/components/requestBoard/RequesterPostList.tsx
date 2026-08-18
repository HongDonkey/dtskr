import { Box, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import type { RequesterPost } from '../../api/requestBoard'
import { requestCategoryKey } from '../../utils/requestCategory'

export function RequesterPostList({ posts }: { posts: RequesterPost[] }) {
  const { t } = useTranslation('main')
  return <Box className="request-my-posts">
    {posts.map((post) => <Box className="request-my-post" key={post.id}>
      <Box><Typography component="span">#{post.id} · {t(requestCategoryKey(post.category))}</Typography><Typography component="strong">{post.title}</Typography></Box>
      <Typography>{post.content}</Typography>
      {post.adminResponse && <Box className="request-admin-response"><Typography component="strong">{t('board.adminResponse')}</Typography><Typography>{post.adminResponse}</Typography>{post.respondedAt && <Typography component="small">{new Date(post.respondedAt).toLocaleString()}</Typography>}</Box>}
      <Typography component="small">{t(`board.statuses.${post.status}`)} · {new Date(post.createdAt).toLocaleDateString()} · {t('admin.attachments', { count: post.attachmentCount })}</Typography>
    </Box>)}
    {posts.length === 0 && <Typography className="request-board-empty">{t('board.noMyPosts')}</Typography>}
  </Box>
}
