import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import type { Language } from '../types/layout'
import { languageToSearchLocale, languageToSeoLocale } from '../utils/language'

type PageMetadataProps = {
  language: Language
  title: string
  description: string
  imageUrl?: string | null
  noIndex?: boolean
  structuredData?: Record<string, unknown> | null
}

const upsertMeta = (selector: string, attributes: Record<string, string>) => {
  let element = document.head.querySelector<HTMLMetaElement>(selector)
  if (!element) {
    element = document.createElement('meta')
    document.head.appendChild(element)
  }
  Object.entries(attributes).forEach(([key, value]) => element!.setAttribute(key, value))
}

const absoluteUrl = (value: string) => new URL(value, window.location.origin).toString()

export function PageMetadata({
  language,
  title,
  description,
  imageUrl,
  noIndex = false,
  structuredData,
}: PageMetadataProps) {
  const location = useLocation()

  useEffect(() => {
    const localizedUrl = (targetLanguage: Language) => {
      const url = new URL(location.pathname, window.location.origin)
      url.searchParams.set('lang', languageToSearchLocale[targetLanguage])
      return url.toString()
    }
    const canonicalUrl = localizedUrl(language)

    document.title = title
    document.documentElement.lang = languageToSeoLocale[language]
    upsertMeta('meta[name="description"]', { name: 'description', content: description })
    upsertMeta('meta[name="robots"]', {
      name: 'robots',
      content: noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large',
    })
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: title })
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: description })
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: 'website' })
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl })
    upsertMeta('meta[property="og:locale"]', {
      property: 'og:locale',
      content: language === 'KR' ? 'ko_KR' : language === 'EN' ? 'en_US' : 'ja_JP',
    })
    upsertMeta('meta[name="twitter:card"]', {
      name: 'twitter:card',
      content: imageUrl ? 'summary_large_image' : 'summary',
    })

    if (imageUrl) {
      const resolvedImageUrl = absoluteUrl(imageUrl)
      upsertMeta('meta[property="og:image"]', { property: 'og:image', content: resolvedImageUrl })
      upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: resolvedImageUrl })
    } else {
      document.head.querySelector('meta[property="og:image"]')?.remove()
      document.head.querySelector('meta[name="twitter:image"]')?.remove()
    }

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = canonicalUrl

    document.head.querySelectorAll('link[data-seo-alternate]').forEach((element) => element.remove())
    const alternates: Array<[string, Language]> = [
      ['ko', 'KR'],
      ['en', 'EN'],
      ['ja', 'JP'],
      ['x-default', 'KR'],
    ]
    alternates.forEach(([hreflang, targetLanguage]) => {
      const alternate = document.createElement('link')
      alternate.rel = 'alternate'
      alternate.hreflang = hreflang
      alternate.href = localizedUrl(targetLanguage)
      alternate.dataset.seoAlternate = 'true'
      document.head.appendChild(alternate)
    })

    document.getElementById('page-structured-data')?.remove()
    if (structuredData && !noIndex) {
      const script = document.createElement('script')
      script.id = 'page-structured-data'
      script.type = 'application/ld+json'
      script.text = JSON.stringify(structuredData)
      document.head.appendChild(script)
    }

    return () => document.getElementById('page-structured-data')?.remove()
  }, [description, imageUrl, language, location.pathname, noIndex, structuredData, title])

  return null
}
