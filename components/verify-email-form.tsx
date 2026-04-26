"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { authApi } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Globe } from "lucide-react"
import { toast } from "sonner"

/**
 * Verifies email from `?token=` or lets the user resend the link using `?email=` or manual input.
 */
export function VerifyEmailForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setToken, isAuthenticated } = useAuth()
  const token = searchParams.get("token")
  const emailParam = searchParams.get("email")

  const [verifyState, setVerifyState] = useState<"idle" | "loading" | "done" | "error">("idle")
  const [resendEmail, setResendEmail] = useState(emailParam?.trim() ?? "")
  const [resendLoading, setResendLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/feed")
    }
  }, [isAuthenticated, router])

  useEffect(() => {
    if (!token?.trim()) {
      return
    }
    let cancelled = false
    setVerifyState("loading")
    ;(async () => {
      try {
        const res = await authApi.verifyEmail({ token: token.trim() })
        if (cancelled) return
        setToken(res.token)
        toast.success("Email verified — you are signed in")
        setVerifyState("done")
        router.replace("/feed")
      } catch (e) {
        if (cancelled) return
        setVerifyState("error")
        toast.error((e as Error).message ?? "Verification failed")
      }
    })()
    return () => {
      cancelled = true
    }
  }, [token, router, setToken])

  const handleResend = useCallback(async () => {
    const email = resendEmail.trim()
    if (!email) {
      toast.error("Enter your email")
      return
    }
    setResendLoading(true)
    try {
      await authApi.resendVerification({ email })
      toast.success("If an account exists, a new link has been sent.")
    } catch (e) {
      toast.error((e as Error).message ?? "Could not resend")
    } finally {
      setResendLoading(false)
    }
  }, [resendEmail])

  if (token?.trim()) {
    if (verifyState === "error") {
      return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted flex flex-col items-center justify-center p-4">
          <header className="absolute top-0 left-0 right-0 p-4 flex items-center gap-2">
            <Globe className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">civicGram</h1>
          </header>
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Link expired or invalid</CardTitle>
              <CardDescription>
                Request a new verification email below, then check your inbox.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resend">Email</Label>
                <Input
                  id="resend"
                  type="email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="you@example.com"
                  disabled={resendLoading}
                  autoComplete="email"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button className="w-full" onClick={handleResend} disabled={resendLoading}>
                {resendLoading ? "Sending…" : "Resend verification email"}
              </Button>
              <Link href="/login" className="text-sm text-primary hover:underline">
                Back to log in
              </Link>
            </CardFooter>
          </Card>
        </div>
      )
    }
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex flex-col items-center justify-center p-4">
        <p className="text-muted-foreground">Verifying your email…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex flex-col items-center justify-center p-4">
      <header className="absolute top-0 left-0 right-0 p-4 flex items-center gap-2">
        <Globe className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold">civicGram</h1>
      </header>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Verify your email</CardTitle>
          <CardDescription>
            We sent a link to your inbox. Open it on this device to finish signing up, or resend the
            email below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="resend2">Email</Label>
            <Input
              id="resend2"
              type="email"
              value={resendEmail}
              onChange={(e) => setResendEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={resendLoading}
              autoComplete="email"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button className="w-full" onClick={handleResend} disabled={resendLoading}>
            {resendLoading ? "Sending…" : "Resend verification email"}
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            <Link href="/login" className="text-primary hover:underline">
              Back to log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
