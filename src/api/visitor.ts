export async function recordVisit(): Promise<void> {
  const response = await fetch('/api/visits', {
    method: 'POST',
    credentials: 'include',
  })
  if (!response.ok) throw new Error('Failed to record visit.')
}
