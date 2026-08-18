import { useQuery } from '@tanstack/react-query'
import { Box, Button, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { searchDigimonsByName } from '../../api/digimon'
import type { DigimonSummary } from '../../types/digimon'

type Props = {
  query: string
  selected: DigimonSummary | null
  onQueryChange: (query: string) => void
  onSelect: (digimon: DigimonSummary) => void
  onClear: () => void
}

export function RelatedDigimonSearch({ query, selected, onQueryChange, onSelect, onClear }: Props) {
  const { t, i18n } = useTranslation('main')
  const normalizedQuery = query.trim()
  const { data: results = [], isFetching } = useQuery({
    queryKey: ['request-board', 'digimon-search', i18n.language, normalizedQuery],
    queryFn: () => searchDigimonsByName(normalizedQuery),
    enabled: !selected && Boolean(normalizedQuery),
  })

  return <Box className="request-digimon-search">
    <label className="request-native-field">
      <span>{t('board.relatedDigimon')}</span>
      <input value={selected?.name ?? query} onChange={(event) => onQueryChange(event.target.value)} placeholder={t('board.relatedDigimonPlaceholder')} maxLength={100} autoComplete="off" />
    </label>
    {selected && <Button type="button" className="request-digimon-clear" onClick={onClear}>{t('board.clearRelatedDigimon')}</Button>}
    {!selected && normalizedQuery && <Box className="request-digimon-results" role="listbox" aria-label={t('board.relatedDigimonResults')}>
      {isFetching && <Typography>{t('board.searchingDigimon')}</Typography>}
      {!isFetching && results.map((digimon) => <Button type="button" role="option" key={digimon.id} onClick={() => onSelect(digimon)}>
        <Box component="img" src={digimon.pixelImageUrl ?? digimon.imageUrl ?? undefined} alt="" />
        <Box><Typography component="strong">{digimon.name}</Typography><Typography component="span">{digimon.stage} · {digimon.digimonType} · {digimon.attribute}</Typography></Box>
      </Button>)}
      {!isFetching && results.length === 0 && <Typography>{t('board.noRelatedDigimon')}</Typography>}
    </Box>}
  </Box>
}
