"use client"

import { GoogleLogin, type CredentialResponse } from "@react-oauth/google"

type GoogleAuthButtonProps = {
  /** Called with Google ID token (JWT) for the backend. */
  onCredential: (credential: string) => void
  disabled?: boolean
}

/**
 * Renders Google Sign-In when `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set (requires `GoogleOAuthProvider` ancestor).
 */
export function GoogleAuthButton({ onCredential, disabled }: GoogleAuthButtonProps) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim()
  if (!clientId) {
    return null
  }

  return (
    <div
      className={`flex w-full justify-center [&>div]:!w-full ${disabled ? "pointer-events-none opacity-50" : ""}`}
    >
      <GoogleLogin
        width={384}
        size="large"
        text="continue_with"
        shape="rectangular"
        useOneTap={false}
        onSuccess={(res: CredentialResponse) => {
          if (disabled) return
          if (res.credential) {
            onCredential(res.credential)
          }
        }}
        onError={() => {
          // Parent shows toast on failed credential exchange
        }}
      />
    </div>
  )
}
