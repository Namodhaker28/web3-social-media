import { Suspense } from "react"
import { VerifyEmailForm } from "@/components/verify-email-form"

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-muted-foreground">
          Loading…
        </div>
      }
    >
      <VerifyEmailForm />
    </Suspense>
  )
}
