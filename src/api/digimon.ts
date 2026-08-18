import type { DigimonDetail, DigimonSummary } from '../types/digimon'
import type { EvolutionRoutes } from '../types/evolution'
import i18n from '../i18n'

export type SystemHealth = {
  server: 'UP' | 'DOWN'
  database: 'UP' | 'DOWN'
}

const catalogRequest = (options: Parameters<typeof fetch>[1] = {}) => ({
  ...options,
  headers: { ...options.headers, 'Accept-Language': i18n.language.startsWith('en') ? 'en' : 'ko' },
})

async function getDigimons(endpoint: string): Promise<DigimonSummary[]> {
  const response = await fetch(endpoint, catalogRequest({ cache: 'no-store' }))

  if (!response.ok) {
    throw new Error(`Failed to load Digimons: ${response.status}`)
  }

  return (await response.json()) as DigimonSummary[]
}

export async function getSystemHealth(): Promise<SystemHealth> {
  const response = await fetch('/api/health', { cache: 'no-store' })

  if (!response.ok) {
    throw new Error(`Failed to check system health: ${response.status}`)
  }

  return (await response.json()) as SystemHealth
}

export async function getDigimonCounts(): Promise<Record<string, number>> {
  const response = await fetch('/api/digimons/counts', catalogRequest())

  if (!response.ok) {
    throw new Error(`Failed to load Digimon counts: ${response.status}`)
  }

  return (await response.json()) as Record<string, number>
}

export async function getEvolutionCount(): Promise<number> {
  const response = await fetch('/api/digimons/evolution-count', catalogRequest({ cache: 'no-store' }))
  if (!response.ok) throw new Error(`Failed to load evolution count: ${response.status}`)
  return ((await response.json()) as { count: number }).count
}

export const searchDigimonsByName = (query: string) =>
  getDigimons(`/api/digimons/search?query=${encodeURIComponent(query)}`)

export async function getEvolutionRoutes(digimonId: number): Promise<EvolutionRoutes> {
  const response = await fetch(`/api/digimons/${digimonId}/evolution-routes`, catalogRequest({
    cache: 'no-store',
  }))

  if (!response.ok) {
    throw new Error(`Failed to load evolution routes: ${response.status}`)
  }

  return (await response.json()) as EvolutionRoutes
}

export async function getDigimonDetail(digimonId: number): Promise<DigimonDetail> {
  const response = await fetch(`/api/digimons/${digimonId}`, catalogRequest({ cache: 'no-store' }))

  if (!response.ok) {
    throw new Error(`Failed to load Digimon detail: ${response.status}`)
  }

  return (await response.json()) as DigimonDetail
}

export const getAllDigimons = () => getDigimons('/api/digimons/getAll')

export const getDigimonsByStage = (stageCode: string) =>
  getDigimons(`/api/digimons/by-stage?stageCode=${encodeURIComponent(stageCode)}`)
