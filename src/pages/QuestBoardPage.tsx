import { Box, Button, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink, useOutletContext, useParams } from 'react-router-dom'
import { getQuest, getQuests } from '../api/quest'
import { PageMetadata } from '../components/PageMetadata'
import type { AppOutletContext } from '../types/layout'
import { languageToLocale } from '../utils/language'

export function QuestBoardPage() {
  const { t } = useTranslation('quest')
  const { language } = useOutletContext<AppOutletContext>()
  const { questId } = useParams()
  const languageCode = languageToLocale[language]

  const listQuery = useQuery({
    queryKey: ['quests', languageCode],
    queryFn: getQuests,
  })
  const selectedQuestId = questId ? Number(questId) : listQuery.data?.[0]?.id
  const detailQuery = useQuery({
    queryKey: ['quest', selectedQuestId, languageCode],
    queryFn: () => getQuest(selectedQuestId!),
    enabled: Number.isInteger(selectedQuestId),
  })
  const quest = detailQuery.data
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
  const scrollToBottom = () => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' })

  return (
    <Box component="main" className="quest-board-page">
      <PageMetadata
        language={language}
        title={quest ? `${quest.title} | DIGIVOLUTION` : t('seo.title')}
        description={quest?.summary ?? t('seo.description')}
        imageUrl={quest?.images[0]?.imageUrl}
      />
      <Box className="quest-board-grid" />
      <Box className="quest-scroll-controls" aria-label={t('scrollControls')}>
        <Button type="button" onClick={scrollToTop} aria-label={t('scrollTop')} title={t('scrollTop')}>↑</Button>
        <Button type="button" onClick={scrollToBottom} aria-label={t('scrollBottom')} title={t('scrollBottom')}>↓</Button>
      </Box>
      <Box className="quest-board-shell">
        <Button component={RouterLink} to="/" className="quest-board-back">&larr; {t('back')}</Button>
        <Box className="quest-board-layout">
          <Box component="aside" className="quest-sidebar">
            <Typography component="p" className="quest-sidebar-title">{t('contents')}</Typography>
            <Box component="nav" aria-label={t('title')}>
              {listQuery.data?.map((item, index) => (
                <Button
                  component={RouterLink}
                  to={`/quests/${item.id}`}
                  className={selectedQuestId === item.id ? 'active' : undefined}
                  key={item.id}
                >
                  <Box component="span">{String(index + 1).padStart(2, '0')}</Box>
                  <Typography component="strong">{item.title}</Typography>
                </Button>
              ))}
            </Box>
          </Box>

          <Box className="quest-board-content">
            {(listQuery.isPending || detailQuery.isPending) && <Typography className="quest-board-state">{t('loading')}</Typography>}
            {(listQuery.isError || detailQuery.isError) && <Typography className="quest-board-state error">{t('loadError')}</Typography>}
            {listQuery.data?.length === 0 && <Typography className="quest-board-state">{t('empty')}</Typography>}
            {quest && (
              <Box component="article" className="quest-detail-panel">
                <Box className="quest-detail-heading">
                  <Typography component="p">QUEST GUIDE / {t(`categories.${quest.category}`, { defaultValue: quest.category })}</Typography>
                  <Typography component="h1">{quest.title}</Typography>
                  <Typography component="p">{quest.summary}</Typography>
                  {quest.content && <Typography component="p" className="quest-detail-content">{quest.content}</Typography>}
                </Box>
                <Box className="quest-image-sequence">
                  {quest.images.map((image) => (
                    <Box component="section" className="quest-image-step" id={`location-${image.sortOrder}`} key={image.sortOrder}>
                      <Box component="img" src={image.imageUrl} alt={t('imageAlt', { title: quest.title, number: image.sortOrder })} loading={image.sortOrder < 3 ? 'eager' : 'lazy'} />
                      <Box className="quest-location-info">
                        <Typography component="span">{String(image.sortOrder).padStart(2, '0')}</Typography>
                        <Box>
                          <Typography component="small">{t('location')}</Typography>
                          <Typography component="h2">{image.locationName}</Typography>
                          {image.locationNote && <Typography component="p">{image.locationNote}</Typography>}
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
