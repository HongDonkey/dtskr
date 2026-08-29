import i18n from '../i18n'

export type QuestSummary = {
  id: number
  category: string
  title: string
  summary: string
  thumbnailUrl: string | null
  imageCount: number
  updatedAt: string
}

export type QuestDetail = Omit<QuestSummary, 'thumbnailUrl' | 'imageCount'> & {
  content: string | null
  images: Array<{
    sortOrder: number
    imageUrl: string
    locationName: string
    locationNote: string | null
  }>
}

const loadJson = async <T>(url: string): Promise<T> => {
  const language = i18n.language.startsWith('en') ? 'en' : i18n.language.startsWith('jp') ? 'jp' : 'ko'
  const response = await fetch(url, {
    cache: 'no-store',
    headers: { 'Accept-Language': language },
  })
  if (!response.ok) throw new Error(`Failed to load quest information: ${response.status}`)
  return (await response.json()) as T
}

export const getQuests = () => loadJson<QuestSummary[]>('/api/quests')

export const getQuest = (questId: number) => loadJson<QuestDetail>(`/api/quests/${questId}`)
