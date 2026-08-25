import type { DigimonSummary } from './digimon'

export type EvolutionDirection = 'prior' | 'next'

export type EvolutionRouteNode = DigimonSummary & {
  conditionText: string | null
  requiredAgentRank: number | null
  requiredItemId: number | null
  requiredItemName: string | null
  children: EvolutionRouteNode[]
}

export type EvolutionRoutes = {
  current: EvolutionRouteNode
  previous: EvolutionRouteNode[]
  next: EvolutionRouteNode[]
}

export type EvolutionTreeNode = {
  id: string
  digimonId: number
  name: string
  stage: string
  personality: string
  type: string
  symbol: string
  pixelImageUrl?: string | null
  conditionText?: string | null
  tone: string
  children?: EvolutionTreeNode[]
}

export type EvolutionTreeNodeViewProps = {
  node: EvolutionTreeNode
  depth: number
  expandedNodeIds: Set<string>
  selectedNodeId: string | null
  onToggle: (id: string) => void
  onSelect: (node: EvolutionTreeNode) => void
}
