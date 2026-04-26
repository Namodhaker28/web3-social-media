"use client"

import type { ReactNode } from "react"
import { GoogleOAuthProvider } from "@react-oauth/google"
import { AuthProvider } from "@/components/auth-provider"

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ""

/**
 * Composes auth with optional Google Identity Services provider when client ID is configured.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  const inner = <AuthProvider>{children}</AuthProvider>
  if (!googleClientId) {
    return inner
  }
  return (
    <GoogleOAuthProvider clientId={googleClientId}>{inner}</GoogleOAuthProvider>
  )
}
