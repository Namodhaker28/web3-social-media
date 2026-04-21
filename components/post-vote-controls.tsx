"use client"

import { Button } from "@/components/ui/button"
import { ArrowBigDown, ArrowBigUp } from "lucide-react"
import { cn } from "@/lib/utils"

export interface PostVoteControlsProps {
  upvotes: number
  downvotes: number
  /** Current user's vote for highlight state. */
  userVote: 1 | -1 | 0
  /** True while the vote request is in flight. */
  loading?: boolean
  onUp: () => void
  onDown: () => void
}

/**
 * Up/down vote controls with separate counts; active vote uses filled green (up) or red (down) arrows.
 */
export function PostVoteControls({
  upvotes,
  downvotes,
  userVote,
  loading,
  onUp,
  onDown,
}: PostVoteControlsProps) {
  return (
    <div className="flex items-center gap-3 sm:gap-4">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-auto gap-1.5 px-2 py-1.5 text-muted-foreground hover:text-foreground"
        onClick={onUp}
        disabled={loading}
        aria-label="Upvote"
        aria-pressed={userVote === 1}
      >
        <ArrowBigUp
          className={cn(
            "h-5 w-5 shrink-0 transition-colors",
            userVote === 1 ? "fill-green-600 text-green-600" : "fill-transparent"
          )}
          strokeWidth={userVote === 1 ? 0 : 2}
        />
        <span className="text-sm font-medium tabular-nums min-w-[1.5rem] text-left text-foreground">
          {upvotes}
        </span>
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-auto gap-1.5 px-2 py-1.5 text-muted-foreground hover:text-foreground"
        onClick={onDown}
        disabled={loading}
        aria-label="Downvote"
        aria-pressed={userVote === -1}
      >
        <ArrowBigDown
          className={cn(
            "h-5 w-5 shrink-0 transition-colors",
            userVote === -1 ? "fill-red-600 text-red-600" : "fill-transparent"
          )}
          strokeWidth={userVote === -1 ? 0 : 2}
        />
        <span className="text-sm font-medium tabular-nums min-w-[1.5rem] text-left text-foreground">
          {downvotes}
        </span>
      </Button>
    </div>
  )
}
