"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth, type RegisterCredentials } from "@/components/auth-provider"
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

/** Validate register payload (name, email, mobile, password). */
function validateRegister(
  creds: RegisterCredentials & { confirmPassword?: string }
): string | null {
  const name = creds.name?.trim() ?? ""
  if (!name) return "Enter your name"
  if (name.length > 100) return "Name must be at most 100 characters"
  if (!creds.email?.trim()) return "Enter your email"
  if (!isValidEmail(creds.email)) return "Invalid email format"
  if (!creds.mobile?.trim()) return "Enter your mobile number"
  if (!isValidMobile(creds.mobile)) return "Invalid mobile format (e.g. +1234567890)"
  if (!creds.password || creds.password.length < 8) return "Password must be at least 8 characters"
  if (creds.confirmPassword !== creds.password) return "Passwords do not match"
  return null
}

export function RegisterPage() {
  const router = useRouter()
  const { register, loginWithGoogle, isAuthenticated } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [mobile, setMobile] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  if (isAuthenticated) {
    router.push("/feed")
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const creds: RegisterCredentials & { confirmPassword?: string } = {
      name: name.trim(),
      email: email.trim(),
      mobile: mobile.trim(),
      password,
      confirmPassword,
    }
    const err = validateRegister(creds)
    if (err) {
      toast.error(err)
      return
    }
    setLoading(true)
    try {
      const res = await register({
        name: creds.name,
        email: creds.email,
        mobile: creds.mobile,
        password: creds.password,
      })
      toast.success(res.message)
      router.push(`/verify-email?email=${encodeURIComponent(res.email)}`)
    } catch (e) {
      toast.error((e as Error).message ?? "Registration failed")
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
          <CardTitle>Sign up</CardTitle>
          <CardDescription>
            Add your name, email, and mobile; we assign a unique username you can change later in
            your profile. You must verify your email before signing in.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your display name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading || googleLoading}
                autoComplete="name"
              />
            </div>
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
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading || googleLoading}
                  autoComplete="new-password"
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
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading || googleLoading}
                  autoComplete="new-password"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-10 w-10 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  disabled={loading || googleLoading}
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirmPassword ? (
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
              {loading ? "Creating account…" : "Sign up"}
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
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Log in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
