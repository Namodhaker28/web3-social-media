import { Badge } from "@/components/ui/badge"
import type { ModerationStatus } from "@/lib/api-types"

interface ModerationBadgeProps {
  status?: ModerationStatus
  /** When status is rejected, show reason to author/admin. */
  rejectionReason?: string
}

/** Label for non-approved posts on profile and admin queues. */
export function ModerationBadge({ status, rejectionReason }: ModerationBadgeProps) {
  const s = status ?? "approved"
  if (s === "approved") return null
  const label = s === "pending" ? "Pending review" : "Rejected"
  const variant: "secondary" | "destructive" = s === "pending" ? "secondary" : "destructive"
  return (
    <div className="space-y-1">
      <Badge variant={variant}>{label}</Badge>
      {s === "rejected" && rejectionReason ? (
        <p className="text-xs text-muted-foreground max-w-prose">{rejectionReason}</p>
      ) : null}
    </div>
  )
}
