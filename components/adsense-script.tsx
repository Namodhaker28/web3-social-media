"use client"

import Script from "next/script"

/** Loads AdSense once when NEXT_PUBLIC_ADSENSE_CLIENT is set. */
export function AdsenseScript() {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT
  if (!client) return null
  return (
    <Script
      id="adsense-lib"
      strategy="afterInteractive"
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`}
    />
  )
}
