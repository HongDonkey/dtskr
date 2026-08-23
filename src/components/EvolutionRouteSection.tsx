import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Box, Button, IconButton, Typography } from '@mui/material'
import Grid from '@mui/material/Grid'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getEvolutionRoutes } from '../api/digimon'
import type { DigimonSummary } from '../types/digimon'
import type {
  EvolutionDirection,
  EvolutionRouteNode,
  EvolutionTreeNode,
  EvolutionTreeNodeViewProps,
} from '../types/evolution'
import { languageToSearchLocale, localeToLanguage } from '../utils/language'

function toTreeNode(node: EvolutionRouteNode, path = String(node.id)): EvolutionTreeNode {
  return {
    id: path,
    digimonId: node.id,
    name: node.name,
    stage: node.stage,
    type: `${node.digimonType} · ${node.attribute}`,
    symbol: node.name.slice(0, 1),
    pixelImageUrl: node.pixelImageUrl,
    conditionText: node.conditionText ?? '',
    tone: 'blue',
    children: node.children.map((child, index) =>
      toTreeNode(child, `${path}-${child.id}-${index}`)
    ),
  }
}

export function EvolutionRouteSection({ digimon }: { digimon: DigimonSummary | null }) {
  const { t, i18n } = useTranslation('evolution')
  const navigate = useNavigate()
  const [direction, setDirection] = useState<EvolutionDirection>('next')
  const [expansionState, setExpansionState] = useState<{ key: string; ids: Set<string> }>({
    key: '',
    ids: new Set(),
  })
  const { data, isLoading, isError } = useQuery({
    queryKey: ['digimon-evolution-routes', i18n.language, digimon?.id],
    queryFn: () => getEvolutionRoutes(digimon!.id),
    enabled: digimon !== null,
  })
  const trees = useMemo<Record<EvolutionDirection, EvolutionTreeNode[]>>(
    () => ({
      prior: data?.previous.map((node) => toTreeNode(node)) ?? [],
      next: data?.next.map((node) => toTreeNode(node)) ?? [],
    }),
    [data]
  )
  const current = data?.current ?? digimon
  const expansionKey = `${digimon?.id ?? 'none'}:${direction}`
  const expandedIds = expansionState.key === expansionKey ? expansionState.ids : new Set<string>()

  return (
    <Grid container component="section" className="panel route-section" id="dex">
      <Grid container size={12} className="route-heading" sx={{ alignItems: 'center' }}>
        <Box component="span" className="step">
          02
        </Box>
        <Box>
          <Typography component="p">EVOLUTION ROUTE</Typography>
          <Typography component="h2">
            <Typography component="em">{current?.name ?? t('evolution.unknown')}</Typography>
            {t('evolution.titleSuffix')}
          </Typography>
        </Box>
      </Grid>
      <Box className="evolution-tabs" role="tablist" aria-label={t('evolution.directionLabel')}>
        <Button
          className={direction === 'prior' ? 'active' : ''}
          onClick={() => setDirection('prior')}
          role="tab"
        >
          ← {t('evolution.previous')}
        </Button>
        <Button
          className={direction === 'next' ? 'active' : ''}
          onClick={() => setDirection('next')}
          role="tab"
        >
          {t('evolution.next')} →
        </Button>
      </Box>
      <Box className="tree-panel">
        <Typography component="h3" className="tree-title">
          {t(direction === 'prior' ? 'evolution.previousRoutes' : 'evolution.nextRoutes')}
        </Typography>
        <Box className="tree-workspace">
          <Box className="tree-primary">
            <Button
              component={RouterLink}
              to={current ? `/digimons/${current.id}?lang=${languageToSearchLocale[localeToLanguage(i18n.language)]}` : '#'}
              className="tree-focus"
              disabled={!current}
              aria-label={
                current
                  ? t('evolution.detailLabel', { name: current.name })
                  : t('evolution.noneSelected')
              }
            >
              <Box className="tree-focus-core">
                {current?.pixelImageUrl ? (
                  <Box component="img" className="tree-pixel" src={current.pixelImageUrl} alt="" />
                ) : (
                  (current?.name.slice(0, 1) ?? '?')
                )}
              </Box>
              <Box>
                <Typography component="small">{t('evolution.current')}</Typography>
                <Typography component="strong">
                  {current?.name ?? t('evolution.noneSelected')}
                </Typography>
                <Typography component="p">
                  {current
                    ? `${current.stage} · ${current.digimonType} · ${current.attribute}`
                    : ''}
                </Typography>
              </Box>
            </Button>
          </Box>
          <Box className="branch-tree">
            {isLoading && <Typography className="empty">{t('evolution.loading')}</Typography>}
            {isError && <Typography className="empty">{t('evolution.error')}</Typography>}
            {!isLoading && !isError && !trees[direction].length && (
              <Typography className="empty">
                {t(direction === 'prior' ? 'evolution.emptyPrevious' : 'evolution.emptyNext')}
              </Typography>
            )}
            {trees[direction].map((node) => (
              <EvolutionTreeNodeView
                key={node.id}
                node={node}
                depth={0}
                expandedNodeIds={expandedIds}
                selectedNodeId={null}
                onSelect={(next) => navigate(`/digimons/${next.digimonId}`)}
                onToggle={(id) =>
                  setExpansionState((state) => {
                    const ids = new Set(state.key === expansionKey ? state.ids : [])
                    ids.has(id) ? ids.delete(id) : ids.add(id)
                    return { key: expansionKey, ids }
                  })
                }
              />
            ))}
          </Box>
        </Box>
      </Box>
    </Grid>
  )
}

function EvolutionTreeNodeView({
  node,
  depth,
  expandedNodeIds,
  selectedNodeId,
  onToggle,
  onSelect,
}: EvolutionTreeNodeViewProps) {
  const { t, i18n } = useTranslation('evolution')
  const hasChildren = Boolean(node.children?.length)
  const expanded = expandedNodeIds.has(node.id)
  return (
    <Box className="tree-branch" data-depth={depth}>
      <Box className={`tree-node ${hasChildren && expanded ? 'expanded' : ''}`}>
        {hasChildren ? (
          <IconButton
            className="tree-route-toggle"
            onClick={() => onToggle(node.id)}
            aria-label={t('evolution.toggleLabel', {
              name: node.name,
              action: t(expanded ? 'evolution.collapse' : 'evolution.expand'),
            })}
          >
            {expanded ? '−' : '+'}
          </IconButton>
        ) : (
          <Box className="tree-route-toggle-placeholder" />
        )}
        <Button
          component={RouterLink}
          to={`/digimons/${node.digimonId}?lang=${languageToSearchLocale[localeToLanguage(i18n.language)]}`}
          className={`tree-node-card ${selectedNodeId === node.id ? 'selected' : ''}`}
          onClick={(event) => {
            event.preventDefault()
            onSelect(node)
          }}
        >
          <Box className={`tree-node-icon ${node.tone}`}>
            {node.pixelImageUrl ? (
              <Box component="img" className="tree-pixel" src={node.pixelImageUrl} alt="" />
            ) : (
              node.symbol
            )}
          </Box>
          <Box className="tree-node-copy">
            <Typography component="small">{node.stage}</Typography>
            <Typography component="strong">{node.name}</Typography>
            <Typography component="p">{node.type}</Typography>
          </Box>
          <Box className="tree-node-condition">
            <Typography component="b">{t('evolution.condition')}</Typography>
            {node.conditionText ? (
              <Box className="tree-condition-list">
                {node.conditionText.split(',').map((condition, index) => (
                  <Box
                    component="span"
                    className="tree-condition-item"
                    key={`${condition.trim()}-${index}`}
                  >
                    {condition.trim()}
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography component="span" className="tree-condition-empty">
                {t('evolution.noCondition')}
              </Typography>
            )}
          </Box>
        </Button>
      </Box>
      {hasChildren && expanded && (
        <Box className="tree-children">
          {node.children?.map((child) => (
            <EvolutionTreeNodeView
              key={child.id}
              node={child}
              depth={depth + 1}
              expandedNodeIds={expandedNodeIds}
              selectedNodeId={selectedNodeId}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </Box>
      )}
    </Box>
  )
}
