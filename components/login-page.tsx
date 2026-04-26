"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth, type AuthCredentials } from "@/components/auth-provider"
import { GoogleAuthButton } from "@/components/google-auth-button"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Globe } from "lucide-react"
import { toast } from "sonner"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MOBILE_REGEX = /^\+?[0-9]{10,15}$/

/** Validate email format. */
function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim())
}

/** Validate E.164-style mobile format. */
function isValidMobile(mobile: string): boolean {
  return MOBILE_REGEX.test(mobile.trim())
}

/** Validate login credentials (email XOR mobile required). */
function validateLogin(creds: AuthCredentials): string | null {
  const hasEmail = !!creds.email?.trim()
  const hasMobile = !!creds.mobile?.trim()
  if (!hasEmail && !hasMobile) return "Enter email or mobile number"
  if (hasEmail && hasMobile) return "Enter email or mobile, not both"
  if (hasEmail && !isValidEmail(creds.email!)) return "Invalid email format"
  if (hasMobile && !isValidMobile(creds.mobile!)) return "Invalid mobile format (e.g. +1234567890)"
  if (!creds.password || creds.password.length < 8) return "Password must be at least 8 characters"
  return null
}

export function LoginPage() {
  const router = useRouter()
  const { login, loginWithGoogle, isAuthenticated } = useAuth()
  const [email, setEmail] = useState("")
  const [mobile, setMobile] = useState("")
  const [password, setPassword] = useState("")
  const [useEmail, setUseEmail] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  if (isAuthenticated) {
    router.push("/feed")
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const creds: AuthCredentials = {
      password,
      ...(useEmail ? { email: email.trim() } : { mobile: mobile.trim() }),
    }
    const err = validateLogin(creds)
    if (err) {
      toast.error(err)
      return
    }
    setLoading(true)
    try {
      await login(creds)
      toast.success("Logged in")
      router.push("/feed")
    } catch (e) {
      const msg = (e as Error).message ?? "Login failed"
      const needsVerify = msg.toLowerCase().includes("verify your email")
      const em = useEmail ? email.trim() : ""
      if (needsVerify && em) {
        toast.error(msg, {
          action: {
            label: "Resend link",
            onClick: () =>
              router.push(`/verify-email?email=${encodeURIComponent(em)}`),
          },
        })
      } else {
        toast.error(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleCredential = async (credential: string) => {
    setGoogleLoading(true)
    try {
      await loginWithGoogle(credential)
      toast.success("Signed in with Google")
      router.push("/feed")
    } catch (e) {
      toast.error((e as Error).message ?? "Google sign-in failed")
    } finally {
      setGoogleLoading(false)
    }
  }

  const showGoogle = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim())

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex flex-col items-center justify-center p-4">
      <header className="absolute top-0 left-0 right-0 p-4 flex items-center gap-2">
        <Globe className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold">civicGram</h1>
      </header>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Log in</CardTitle>
          <CardDescription>Use email or mobile + password, or continue with Google</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button
                type="button"
                variant={useEmail ? "default" : "outline"}
                size="sm"
                onClick={() => setUseEmail(true)}
                disabled={loading || googleLoading}
              >
                Email
              </Button>
              <Button
                type="button"
                variant={!useEmail ? "default" : "outline"}
                size="sm"
                onClick={() => setUseEmail(false)}
                disabled={loading || googleLoading}
              >
                Mobile
              </Button>
            </div>
            {useEmail ? (
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading || googleLoading}
                  autoComplete="email"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile</Label>
                <Input
                  id="mobile"
                  type="tel"
                  placeholder="+1234567890"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  disabled={loading || googleLoading}
                  autoComplete="tel"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading || googleLoading}
                  autoComplete="current-password"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-10 w-10 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword((v) => !v)}
                  disabled={loading || googleLoading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading || googleLoading}>
              {loading ? "Logging in…" : "Log in"}
            </Button>
            {showGoogle && (
              <>
                <div className="relative w-full">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or</span>
                  </div>
                </div>
                <GoogleAuthButton
                  onCredential={handleGoogleCredential}
                  disabled={googleLoading || loading}
                />
              </>
            )}
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
            <p className="text-sm text-muted-foreground text-center">
              <Link href="/verify-email" className="text-primary hover:underline">
                Didn&apos;t get a verification email?
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
