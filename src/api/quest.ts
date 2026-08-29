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
  const response = await fetch(url, { cache: 'no-store' })
  if (!response.ok) throw new Error(`Failed to load quest information: ${response.status}`)
  return (await response.json()) as T
}

export const getQuests = (language: string) =>
  loadJson<QuestSummary[]>(`/api/quests?lang=${encodeURIComponent(language)}`)

export const getQuest = (questId: number, language: string) =>
  loadJson<QuestDetail>(`/api/quests/${questId}?lang=${encodeURIComponent(language)}`)
