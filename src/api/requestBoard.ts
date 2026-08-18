export type RequestCategory = 'DATA_CORRECTION' | 'FEATURE' | 'BUG' | 'ETC'

export class RequestRateLimitError extends Error {
  retryAfterSeconds: number

  constructor(retryAfterSeconds: number) {
    super('Request rate limit exceeded.')
    this.name = 'RequestRateLimitError'
    this.retryAfterSeconds = retryAfterSeconds
  }
}

type RequestErrorResponse = {
  message?: string
  code?: string
  retryAfterSeconds?: number
}

async function throwRequestError(response: Response, result: RequestErrorResponse): Promise<never> {
  if (response.status === 429 || result.code === 'RATE_LIMITED') {
    const retryHeader = Number(response.headers.get('Retry-After'))
    throw new RequestRateLimitError(result.retryAfterSeconds ?? (Number.isFinite(retryHeader) ? retryHeader : 60))
  }
  throw new Error(result.message ?? 'Request failed.')
}

export type CreateRequestInput = {
  category: RequestCategory
  title: string
  content: string
  requesterName: string
  requesterPassword: string
  languageCode: 'ko' | 'en' | 'jp'
  relatedDigimonId?: number
  images: File[]
}

export async function createRequestPost(input: CreateRequestInput): Promise<{ id: number; status: string }> {
  const form = new FormData()
  form.append('category', input.category)
  form.append('title', input.title)
  form.append('content', input.content)
  form.append('requesterName', input.requesterName)
  form.append('requesterPassword', input.requesterPassword)
  form.append('languageCode', input.languageCode)
  if (input.relatedDigimonId !== undefined) form.append('relatedDigimonId', String(input.relatedDigimonId))
  input.images.forEach((image) => form.append('images', image))

  const response = await fetch('/api/requests', { method: 'POST', body: form })
  const result = (await response.json()) as { id?: number; status?: string } & RequestErrorResponse
  if (!response.ok) await throwRequestError(response, result)
  return { id: result.id!, status: result.status! }
}

export type RequesterPost = {
  id: number
  category: RequestCategory
  title: string
  content: string
  status: string
  adminResponse: string | null
  respondedAt: string | null
  createdAt: string
  attachmentCount: number
}

export async function getMyRequestPosts(requesterName: string, requesterPassword: string): Promise<RequesterPost[]> {
  const response = await fetch('/api/requests/mine', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requesterName, requesterPassword }),
  })
  const result = (await response.json()) as RequesterPost[] | RequestErrorResponse
  if (!response.ok) await throwRequestError(response, Array.isArray(result) ? {} : result)
  return result as RequesterPost[]
}
