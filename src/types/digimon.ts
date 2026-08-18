export type DigimonSummary = {
  id: number
  name: string
  stage: string
  attribute: string
  digimonType: string
  personality: string
  imageUrl: string | null
  pixelImageUrl: string | null
}

export type DigimonDetail = DigimonSummary & {
  gameCaptureUrl: string | null
  skillImageUrl: string | null
  description: string | null
  evolutionCondition: string | null
  sourceUrl: string | null
  specialSkills: Array<{ name: string; details: string | null; effect: string | null }>
  attachmentSkills: Array<{ requiredLevel: number | null; name: string }>
}
