"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { usersApi } from "@/lib/api-client"
import type { UserEarningsResponse } from "@/lib/api-types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Globe, Loader2 } from "lucide-react"
import { toast } from "sonner"

/** Creator earnings: live estimate for this month and history of closed periods. */
export default function EarningsPage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const [data, setData] = useState<UserEarningsResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/")
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const res = await usersApi.getEarnings()
        if (!cancelled) setData(res)
      } catch (e) {
        if (!cancelled) toast.error((e as Error).message ?? "Failed to load earnings")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) return null
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const est = data?.estimate

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/feed" className="flex items-center gap-2">
            <Globe className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">civicGram</span>
          </Link>
          <Button variant="outline" size="sm" asChild>
            <Link href="/feed">Back to feed</Link>
          </Button>
        </div>
      </header>
      <main className="container max-w-2xl mx-auto px-4 py-8 space-y-6">
        <h1 className="text-2xl font-bold">Creator earnings</h1>
        <p className="text-sm text-muted-foreground">
          Earnings are based on max(0, upvotes − downvotes) per approved post, times the platform rate
          (see below), for posts created in each calendar month. Payouts are processed monthly after
          admin settlement.
        </p>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              This month (
              {est ? `${est.year}-${String(est.month).padStart(2, "0")}` : "—"})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-2xl font-semibold tabular-nums">
              ₹{(est?.estimatedTotalInr ?? 0).toFixed(2)}{" "}
              <span className="text-sm font-normal text-muted-foreground">estimated</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Rate: {est?.ratePaisePerPoint ?? 0} paise per net point ({(est?.ratePaisePerPoint ?? 0) / 100} ₹ per
              point). Totals are not final until the month is closed.
            </p>
            {est && est.posts.length > 0 && (
              <ul className="text-sm border-t pt-3 mt-3 space-y-1">
                {est.posts.map((p) => (
                  <li key={p.postId} className="flex justify-between gap-4">
                    <span className="font-mono text-xs truncate">{p.postId}</span>
                    <span className="tabular-nums">
                      net {p.netScore} → ₹{(p.amountPaise / 100).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Closed periods</CardTitle>
          </CardHeader>
          <CardContent>
            {!data?.history?.length ? (
              <p className="text-sm text-muted-foreground">No closed payout periods yet.</p>
            ) : (
              <ul className="space-y-2">
                {data.history.map((h) => (
                  <li
                    key={h.periodId}
                    className="flex justify-between items-center border-b border-border pb-2 last:border-0"
                  >
                    <span>
                      {h.year}-{String(h.month).padStart(2, "0")}{" "}
                      <span className="text-muted-foreground text-xs ml-2">{h.status}</span>
                    </span>
                    <span className="tabular-nums">₹{(h.totalPaise / 100).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
