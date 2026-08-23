import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Box, Button, InputBase, MenuItem, Select, Typography } from '@mui/material'
import Grid from '@mui/material/Grid'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink } from 'react-router-dom'
import {
  getAllDigimons,
  getDigimonCounts,
  getDigimonsByStage,
  getSystemHealth,
  searchDigimonsByName,
} from '../api/digimon'
import type { DigimonSummary } from '../types/digimon'
import { languageToSearchLocale, localeToLanguage } from '../utils/language'

const stageFilters = [
  { key: 'all', source: '전체', code: null },
  { key: 'baby1', source: '유년기1', code: 'BABY_1' },
  { key: 'baby2', source: '유년기2', code: 'BABY_2' },
  { key: 'rookie', source: '성장기', code: 'ROOKIE' },
  { key: 'champion', source: '성숙기', code: 'CHAMPION' },
  { key: 'ultimate', source: '완전체', code: 'ULTIMATE' },
  { key: 'mega', source: '궁극체', code: 'MEGA' },
  { key: 'megaPlus', source: '초궁극체', code: 'MEGA_PLUS' },
  { key: 'armor', source: '아머체', code: 'ARMOR' },
  { key: 'hybrid', source: '하이브리드체', code: 'HYBRID' },
] as const
type StageKey = (typeof stageFilters)[number]['key']
const emptyDigimons: DigimonSummary[] = []
const searchStateKey = 'digivolution:search-state'

type StoredSearchState = {
  stageKey: StageKey
  attribute: string
  query: string
  isListExpanded: boolean
}

const readSearchState = (): StoredSearchState => {
  try {
    const stored = JSON.parse(sessionStorage.getItem(searchStateKey) ?? '{}') as Partial<StoredSearchState>
    const validStage = stageFilters.some((filter) => filter.key === stored.stageKey)
    return {
      stageKey: validStage ? stored.stageKey! : 'all',
      attribute: typeof stored.attribute === 'string' ? stored.attribute : '',
      query: typeof stored.query === 'string' ? stored.query : '',
      isListExpanded: stored.isListExpanded === true,
    }
  } catch {
    return { stageKey: 'all', attribute: '', query: '', isListExpanded: false }
  }
}

export function SearchSection({
  selectedDigimon,
  onSelect,
}: {
  selectedDigimon: DigimonSummary | null
  onSelect: (digimon: DigimonSummary) => void
}) {
  const { t, i18n } = useTranslation('search')
  const [initialState] = useState(readSearchState)
  const [stageKey, setStageKey] = useState<StageKey>(initialState.stageKey)
  const [selectedAttribute, setSelectedAttribute] = useState(initialState.attribute)
  const [manuallySelectedQuery, setManuallySelectedQuery] = useState<string | null>(null)
  const [isListExpanded, setIsListExpanded] = useState(initialState.isListExpanded)
  const [query, setQuery] = useState(initialState.query)
  const normalizedQuery = query.trim()
  const selectedFilter = stageFilters.find((item) => item.key === stageKey)!
  const stageName = useCallback(
    (filter: (typeof stageFilters)[number]) => t(`stages.${filter.key}`),
    [t]
  )

  const { data: countsByStage = {} } = useQuery({
    queryKey: ['digimon-counts', i18n.language],
    queryFn: getDigimonCounts,
  })
  const { data: systemHealth, isError: isSystemHealthError } = useQuery({
    queryKey: ['system-health'],
    queryFn: getSystemHealth,
    refetchInterval: 10_000,
    retry: false,
  })
  const { data: queriedDigimons } = useQuery({
    queryKey: ['digimons', i18n.language, selectedFilter.code ?? 'all'],
    queryFn: () =>
      selectedFilter.code ? getDigimonsByStage(selectedFilter.code) : getAllDigimons(),
    enabled: !normalizedQuery,
  })
  const { data: searchedDigimons } = useQuery({
    queryKey: ['digimons', i18n.language, 'search', normalizedQuery],
    queryFn: () => searchDigimonsByName(normalizedQuery),
    enabled: Boolean(normalizedQuery),
  })

  const hasStageResults =
    manuallySelectedQuery === normalizedQuery ||
    stageKey === 'all' ||
    searchedDigimons === undefined ||
    searchedDigimons.some((item) => item.stage === stageName(selectedFilter))
  const visibleStageKey: StageKey = hasStageResults ? stageKey : 'all'
  const visibleFilter = stageFilters.find((item) => item.key === visibleStageKey)!
  const digimons = normalizedQuery
    ? (searchedDigimons ?? emptyDigimons)
    : (queriedDigimons ?? emptyDigimons)
  const visibleStageName = stageName(visibleFilter)
  const stageResults = useMemo(
    () => visibleStageKey === 'all' ? digimons : digimons.filter((item) => item.stage === visibleStageName),
    [digimons, visibleStageName, visibleStageKey]
  )
  const attributes = useMemo(
    () => [...new Set(stageResults.map((item) => item.attribute).filter(Boolean))].sort((a, b) => a.localeCompare(b, i18n.language)),
    [i18n.language, stageResults]
  )
  const activeAttribute = attributes.includes(selectedAttribute) ? selectedAttribute : ''
  const results = useMemo(
    () => activeAttribute ? stageResults.filter((item) => item.attribute === activeAttribute) : stageResults,
    [activeAttribute, stageResults]
  )
  const searchCounts = useMemo(
    () =>
      new Map(
        stageFilters.map((filter) => [
          filter.key,
          digimons.filter((item) => filter.key === 'all' || item.stage === stageName(filter))
            .length,
        ])
      ),
    [digimons, stageName]
  )
  const serverOnline = !isSystemHealthError && systemHealth?.server === 'UP'
  const databaseOnline = serverOnline && systemHealth?.database === 'UP'

  useEffect(() => {
    sessionStorage.setItem(searchStateKey, JSON.stringify({ stageKey, attribute: selectedAttribute, query, isListExpanded }))
  }, [isListExpanded, query, selectedAttribute, stageKey])

  const selectStage = (next: StageKey) => {
    setStageKey(next)
    setSelectedAttribute('')
    setManuallySelectedQuery(normalizedQuery || null)
    setIsListExpanded(next !== 'all' || Boolean(normalizedQuery))
  }
  const changeQuery = (value: string) => {
    const nextQuery = value.trim()
    setManuallySelectedQuery(null)
    if (!nextQuery && visibleStageKey === 'all') setStageKey('all')
    setQuery(value)
    setIsListExpanded(Boolean(nextQuery) && nextQuery !== '몬')
  }

  return (
    <Grid container component="section" className="panel planner" id="planner">
      <Grid container size={12} className="panel-heading" sx={{ alignItems: 'center' }}>
        <Box component="span" className="step">
          01
        </Box>
        <Typography component="h2"> {t('search.title')}</Typography>
        <Box className="status-monitor" aria-live="polite">
          <Box className={`service-status ${serverOnline ? 'is-online' : 'is-offline'}`}>
            <Box component="span" />
            {t('status.system')} {t(serverOnline ? 'status.on' : 'status.off')}
          </Box>
          <Box className={`service-status ${databaseOnline ? 'is-online' : 'is-offline'}`}>
            <Box component="span" />
            {t('status.database')} {t(databaseOnline ? 'status.on' : 'status.off')}
          </Box>
        </Box>
      </Grid>
      <Box component="label" className="search">
        <Box component="span">🔎</Box>
        <InputBase
          value={query}
          onChange={(event) => changeQuery(event.target.value)}
          placeholder={t('search.placeholder')}
          inputProps={{ 'aria-label': t('search.inputLabel') }}
        />
        <Box component="kbd">↵</Box>
      </Box>
      <Grid container size={12} className="filters" spacing={1}>
        {stageFilters.map((item) => {
          const countKey = t(`stages.${item.key}`)
          const count = normalizedQuery ? searchCounts.get(item.key) : countsByStage[countKey]
          return (
            <Grid key={item.key} size="auto">
              <Button
                className={visibleStageKey === item.key ? 'selected' : ''}
                onClick={() => selectStage(item.key)}
              >
                <Typography component="strong" className="filter-label">
                  {t(`stages.${item.key}`)}
                </Typography>
                {count !== undefined && (
                  <>
                    <Box component="span" className="filter-separator">
                      |
                    </Box>
                    <Typography component="em" className="filter-count">
                      {count}
                    </Typography>
                  </>
                )}
              </Button>
            </Grid>
          )
        })}
      </Grid>
      <Box className="result-controls">
        <Box className="attribute-filter-group" aria-label={t('attributes.label')}>
          <Typography component="label" className="attribute-filter-title" htmlFor="attribute-filter">
            {t('attributes.label')}
          </Typography>
          <Select
            id="attribute-filter"
            className="attribute-select"
            value={activeAttribute}
            displayEmpty
            onChange={(event) => {
              setSelectedAttribute(event.target.value)
              setIsListExpanded(true)
            }}
            inputProps={{ 'aria-label': t('attributes.label') }}
            MenuProps={{ classes: { paper: 'attribute-select-menu' } }}
          >
            <MenuItem value="">{t('attributes.all')}</MenuItem>
            {attributes.map((attribute) => <MenuItem key={attribute} value={attribute}>{attribute}</MenuItem>)}
          </Select>
        </Box>
        <Button
          className="result-toggle"
          onClick={() => setIsListExpanded((value) => !value)}
          aria-expanded={isListExpanded}
        >
          <Box component="span">{isListExpanded ? '−' : '+'}</Box>
          {t(isListExpanded ? 'search.collapse' : 'search.expand')}
        </Button>
      </Box>
      {isListExpanded && (
        <Grid
          id="digimon-results"
          key={`${normalizedQuery}:${visibleStageKey}`}
          container
          size={12}
          className="digimon-grid"
          spacing={1.25}
        >
          {results.map((item) => (
            <Grid key={item.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Button
                component={RouterLink}
                to={`/digimons/${item.id}?lang=${languageToSearchLocale[localeToLanguage(i18n.language)]}`}
                className={`digimon-card ${selectedDigimon?.id === item.id ? 'selected' : ''}`}
                onClick={(event) => {
                  event.preventDefault()
                  onSelect(item)
                }}
              >
                <Box component="i" className="digimon-card-arrow">
                  →
                </Box>
                <Box component="span" className="portrait blue">
                  {item.pixelImageUrl ? (
                    <Box
                      component="img"
                      className="digimon-pixel"
                      src={item.pixelImageUrl}
                      alt=""
                    />
                  ) : (
                    item.name.slice(0, 1)
                  )}
                </Box>
                <Box component="span">
                  <Typography component="small" className="digimon-card-stage">
                    {item.stage}
                  </Typography>
                  <Typography component="strong">{item.name}</Typography>
                  <Typography component="small">
                    {item.digimonType} · {item.attribute}
                  </Typography>
                </Box>
              </Button>
            </Grid>
          ))}
          {!results.length && (
            <Typography component="p" className="empty">
              {t('search.empty')}
            </Typography>
          )}
        </Grid>
      )}
    </Grid>
  )
}
