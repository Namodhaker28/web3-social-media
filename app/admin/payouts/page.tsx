"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { adminApi, usersApi } from "@/lib/api-client"
import type { ApiUser, PayoutPeriodRow } from "@/lib/api-types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Globe, Loader2 } from "lucide-react"
import { toast } from "sonner"

/** Close payout periods and mark as paid (admin). */
export default function AdminPayoutsPage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const [me, setMe] = useState<ApiUser | null>(null)
  const [periods, setPeriods] = useState<PayoutPeriodRow[]>([])
  const [loading, setLoading] = useState(true)
  const [closeYear, setCloseYear] = useState(String(new Date().getUTCFullYear()))
  const [closeMonth, setCloseMonth] = useState(String(new Date().getUTCMonth() + 1))
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const user = await usersApi.getMe()
      setMe(user)
      if (user.role !== "admin") {
        toast.error("Admin access required")
        router.push("/feed")
        return
      }
      const list = await adminApi.payoutPeriods()
      setPeriods(list)
    } catch (e) {
      toast.error((e as Error).message ?? "Failed to load")
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/")
      return
    }
    void load()
  }, [isAuthenticated, router, load])

  const handleClose = async () => {
    const y = Number(closeYear)
    const m = Number(closeMonth)
    if (!Number.isFinite(y) || !Number.isFinite(m) || m < 1 || m > 12) {
      toast.error("Invalid year/month")
      return
    }
    setBusyId("close")
    try {
      const res = await adminApi.closePayoutPeriod(y, m)
      toast.success(`Closed ${res.year}-${String(res.month).padStart(2, "0")}: ${res.linesCreated} lines`)
      await load()
    } catch (e) {
      toast.error((e as Error).message ?? "Close failed")
    } finally {
      setBusyId(null)
    }
  }

  const handleMarkPaid = async (id: string) => {
    setBusyId(id)
    try {
      await adminApi.markPayoutPaid(id)
      toast.success("Marked paid")
      await load()
    } catch (e) {
      toast.error((e as Error).message ?? "Update failed")
    } finally {
      setBusyId(null)
    }
  }

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/feed" className="flex items-center gap-2">
            <Globe className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">civicGram</span>
          </Link>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/moderation">Moderation</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/feed">Feed</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="container max-w-2xl mx-auto px-4 py-8 space-y-6">
        <h1 className="text-2xl font-bold">Payout periods</h1>
        {me && me.role !== "admin" && (
          <p className="text-destructive text-sm">You do not have admin access.</p>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Close a month</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Snapshots approved posts created in that UTC month with current net scores. Safe to run again
              before marking paid (recomputes lines).
            </p>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="space-y-2">
                <Label htmlFor="y">Year</Label>
                <Input id="y" value={closeYear} onChange={(e) => setCloseYear(e.target.value)} className="w-28" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="m">Month (1–12)</Label>
                <Input id="m" value={closeMonth} onChange={(e) => setCloseMonth(e.target.value)} className="w-24" />
              </div>
              <Button onClick={handleClose} disabled={busyId === "close"}>
                {busyId === "close" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Run settlement"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Periods</CardTitle>
            </CardHeader>
            <CardContent>
              {periods.length === 0 ? (
                <p className="text-sm text-muted-foreground">No periods yet.</p>
              ) : (
                <ul className="space-y-3">
                  {periods.map((p) => (
                    <li
                      key={p.id}
                      className="flex flex-wrap gap-2 justify-between items-center border-b border-border pb-3 last:border-0"
                    >
                      <span>
                        {p.year}-{String(p.month).padStart(2, "0")}{" "}
                        <span className="text-xs text-muted-foreground ml-2">{p.status}</span>
                      </span>
                      <div className="flex gap-2">
                        {p.status !== "paid" && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleMarkPaid(p.id)}
                            disabled={busyId === p.id}
                          >
                            Mark paid
                          </Button>
                        )}
                    </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
