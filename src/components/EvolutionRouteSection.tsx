import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Box, Button, IconButton, Tooltip, Typography } from '@mui/material'
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

type PersonalityGroup = 'valor' | 'amicability' | 'philanthropy' | 'wisdom'
type PersonalityDetailKey =
  | 'zealous' | 'brave' | 'reckless' | 'daring'
  | 'opportunistic' | 'friendly' | 'sociable' | 'compassionate'
  | 'adoring' | 'devoted' | 'tolerant' | 'overprotective'
  | 'enlightened' | 'sly' | 'astute' | 'strategic'

const personalityGroups: Record<PersonalityGroup, string[]> = {
  valor: ['열혈', '용감', '만용', '대담', 'Passionate', 'Zealous', 'Brave', 'Reckless', 'Bold', 'Daring', '熱血', '勇敢', '蛮勇', '豪胆'],
  amicability: ['기회주의자', '친근함', '사교적', '따뜻함', 'Opportunist', 'Opportunistic', 'Friendly', 'Sociable', 'Compassionate', '日和見', '気さく', '社交的', '人情家'],
  philanthropy: ['자애', '헌신적', '포용력', '과보호', 'Adoring', 'Devoted', 'Tolerant', 'Overprotective', '慈愛', '献身的', '包容力', '過保護'],
  wisdom: ['계시', '잔머리', '지혜로움', '전략가', 'Revelation', 'Enlightened', 'Cunning', 'Sly', 'Astute', 'Strategist', 'Strategic', '天啓', '悪知恵', '聡慧', '戦略家'],
}

const personalityImages: Record<PersonalityGroup, string> = {
  valor: '/personality/valor.png',
  amicability: '/personality/amicability.png',
  philanthropy: '/personality/philanthropy.png',
  wisdom: '/personality/wisdom.png',
}

const personalityDetailKeys: Record<string, PersonalityDetailKey> = {
  열혈: 'zealous', Passionate: 'zealous', Zealous: 'zealous', 熱血: 'zealous',
  용감: 'brave', Brave: 'brave', 勇敢: 'brave',
  만용: 'reckless', Reckless: 'reckless', 蛮勇: 'reckless',
  대담: 'daring', Bold: 'daring', Daring: 'daring', 豪胆: 'daring',
  기회주의자: 'opportunistic', Opportunist: 'opportunistic', Opportunistic: 'opportunistic', 日和見: 'opportunistic',
  친근함: 'friendly', Friendly: 'friendly', 気さく: 'friendly',
  사교적: 'sociable', Sociable: 'sociable', 社交的: 'sociable',
  따뜻함: 'compassionate', Compassionate: 'compassionate', 人情家: 'compassionate',
  자애: 'adoring', Adoring: 'adoring', 慈愛: 'adoring',
  헌신적: 'devoted', Devoted: 'devoted', 献身的: 'devoted',
  포용력: 'tolerant', Tolerant: 'tolerant', 包容力: 'tolerant',
  과보호: 'overprotective', Overprotective: 'overprotective', 過保護: 'overprotective',
  계시: 'enlightened', Revelation: 'enlightened', Enlightened: 'enlightened', 天啓: 'enlightened',
  잔머리: 'sly', Cunning: 'sly', Sly: 'sly', 悪知恵: 'sly',
  지혜로움: 'astute', Astute: 'astute', 聡慧: 'astute',
  전략가: 'strategic', Strategist: 'strategic', Strategic: 'strategic', 戦略家: 'strategic',
}

function personalityGroupOf(personality: string): PersonalityGroup | null {
  return (Object.entries(personalityGroups) as Array<[PersonalityGroup, string[]]>)
    .find(([, personalities]) => personalities.includes(personality))?.[0] ?? null
}

function PersonalityBadge({ personality }: { personality: string }) {
  const { t } = useTranslation('evolution')
  const group = personalityGroupOf(personality)
  const detailKey = personalityDetailKeys[personality]

  if (!group || !detailKey) return <Typography component="span" className="tree-personality-badge">{personality}</Typography>

  const detail = (
    <Box className="personality-tooltip-content">
      <Box className="personality-popover-heading">
        <Box
          component="img"
          className="personality-popover-crest"
          src={personalityImages[group]}
          alt=""
          aria-hidden="true"
        />
        <Box>
          <Typography component="small">{t('evolution.personality.groupLabel')}</Typography>
          <Typography component="strong">{t(`evolution.personality.groups.${group}.name`)} · {personality}</Typography>
        </Box>
      </Box>
      <Box className="personality-popover-stat">
        <Typography component="small">{t('evolution.personality.coreStat')}</Typography>
        <Typography component="b">{t(`evolution.personality.groups.${group}.stat`)}</Typography>
      </Box>
      <Box className="personality-detail-effect">
        <Typography component="small">{t('evolution.personality.detailLabel')}</Typography>
        <Typography component="p">
          <Typography component="strong">{t(`evolution.personality.details.${detailKey}.title`)}:</Typography>{' '}
          {t(`evolution.personality.details.${detailKey}.effect`)}
        </Typography>
      </Box>
      <Box className="personality-detail-growth">
        <Typography component="small">{t('evolution.personality.personalGrowth')}</Typography>
        <Typography component="b">{t(`evolution.personality.details.${detailKey}.stat`)}</Typography>
      </Box>
      <Box className="personality-rarity">
        <Typography component="small">{t('evolution.personality.rarityLabel')}</Typography>
        {(['first', 'second'] as const).map((skill) => (
          <Box className="personality-rarity-item" key={skill}>
            <Typography component="strong">{t(`evolution.personality.rarity.${detailKey}.${skill}.title`)}</Typography>
            <Typography component="p">{t(`evolution.personality.rarity.${detailKey}.${skill}.effect`)}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  )

  return (
    <Box component="span" className={`tree-personality-control is-${group}`}>
      <Typography component="span" className="tree-personality-badge">
        <Box
          component="img"
          className="tree-personality-crest"
          src={personalityImages[group]}
          alt=""
          aria-hidden="true"
        />
        {personality}
      </Typography>
      <Tooltip
        title={detail}
        placement="bottom-start"
        arrow
        enterDelay={0}
        enterNextDelay={0}
        leaveDelay={50}
        classes={{
          tooltip: `personality-tooltip is-${group}`,
          arrow: 'personality-tooltip-arrow',
        }}
      >
        <IconButton
          className="tree-personality-info"
          size="small"
          aria-label={t('evolution.personality.openLabel', { personality })}
          onMouseDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
          }}
        >
          ⓘ
        </IconButton>
      </Tooltip>
    </Box>
  )
}

function toTreeNode(node: EvolutionRouteNode, path = String(node.id)): EvolutionTreeNode {
  return {
    id: path,
    digimonId: node.id,
    name: node.name,
    stage: node.stage,
    personality: node.personality,
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
              <Box className="tree-focus-copy">
                <Typography component="small">{t('evolution.current')}</Typography>
                <Typography component="strong">
                  {current?.name ?? t('evolution.noneSelected')}
                </Typography>
                <Box className="tree-meta-row">
                  <Typography component="p">
                    {current
                      ? `${current.stage} · ${current.digimonType} · ${current.attribute}`
                      : ''}
                  </Typography>
                  {current?.personality && (
                    <PersonalityBadge personality={current.personality} />
                  )}
                </Box>
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
            <Box className="tree-meta-row">
              <Typography component="small">{node.stage}</Typography>
              {node.personality && (
                <PersonalityBadge personality={node.personality} />
              )}
            </Box>
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
