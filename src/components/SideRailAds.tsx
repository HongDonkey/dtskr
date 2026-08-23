import { useEffect, useRef } from 'react'
import { Box } from '@mui/material'

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, never>>
  }
}

const adsenseClient = 'ca-pub-7914694136025419'
const leftSlot = import.meta.env.VITE_ADSENSE_LEFT_SLOT?.trim()
const rightSlot = import.meta.env.VITE_ADSENSE_RIGHT_SLOT?.trim()

let adsenseScriptPromise: Promise<void> | null = null

const loadAdsense = (client: string) => {
  if (adsenseScriptPromise) return adsenseScriptPromise

  adsenseScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>('script[data-digivolution-adsense]')
    if (existingScript) {
      if (existingScript.dataset.loaded === 'true' || window.adsbygoogle) resolve()
      else {
        existingScript.addEventListener('load', () => resolve(), { once: true })
        existingScript.addEventListener('error', () => reject(new Error('Failed to load AdSense.')), { once: true })
      }
      return
    }

    const script = document.createElement('script')
    script.async = true
    script.crossOrigin = 'anonymous'
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`
    script.dataset.digivolutionAdsense = 'true'
    script.addEventListener('load', () => {
      script.dataset.loaded = 'true'
      resolve()
    }, { once: true })
    script.addEventListener('error', () => reject(new Error('Failed to load AdSense.')), { once: true })
    document.head.appendChild(script)
  })

  return adsenseScriptPromise
}

function SideRailAd({ side, slot }: { side: 'left' | 'right'; slot: string }) {
  const adRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    let cancelled = false
    void loadAdsense(adsenseClient!).then(() => {
      if (cancelled || adRef.current?.dataset.adsbygoogleStatus) return
      window.adsbygoogle = window.adsbygoogle || []
      window.adsbygoogle.push({})
    }).catch(() => undefined)
    return () => { cancelled = true }
  }, [])

  return (
    <Box component="aside" className={`side-ad-rail side-ad-rail-${side}`} aria-label="Advertisement">
      <Box
        component="ins"
        ref={adRef}
        className="adsbygoogle side-ad-unit"
        data-ad-client={adsenseClient}
        data-ad-slot={slot}
        data-ad-format="vertical"
        data-full-width-responsive="false"
      />
    </Box>
  )
}

export function SideRailAds() {
  useEffect(() => {
    void loadAdsense(adsenseClient).catch(() => undefined)
  }, [])

  if (!leftSlot || !rightSlot) return null

  return (
    <>
      <SideRailAd side="left" slot={leftSlot} />
      <SideRailAd side="right" slot={rightSlot} />
    </>
  )
}
