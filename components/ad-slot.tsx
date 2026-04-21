"use client"

import { useEffect } from "react"

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[]
  }
}

interface AdSlotProps {
  /** AdSense ad unit slot id (numeric string from AdSense UI). */
  slot: string
  className?: string
}

/**
 * Responsive display ad unit. Loads `adsbygoogle` push after mount.
 * Set NEXT_PUBLIC_ADSENSE_CLIENT and NEXT_PUBLIC_ADSENSE_FEED_SLOT in env.
 */
export function AdSlot({ slot, className }: AdSlotProps) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT

  useEffect(() => {
    if (!client || !slot) return
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {
      // Ad blockers or policy blocks
    }
  }, [client, slot])

  if (!client || !slot) {
    return (
      <div
        className={`min-h-[120px] rounded-lg border border-dashed border-muted-foreground/25 flex items-center justify-center text-xs text-muted-foreground px-4 text-center ${className ?? ""}`}
        role="note"
      >
        Ad slot — configure NEXT_PUBLIC_ADSENSE_CLIENT and NEXT_PUBLIC_ADSENSE_FEED_SLOT
      </div>
    )
  }

  return (
    <ins
      className={`adsbygoogle block ${className ?? ""}`}
      style={{ display: "block", minHeight: 120 }}
      data-ad-client={client}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  )
}
