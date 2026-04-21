/**
 * API types aligned with backend responses.
 * author.address / author.avatar match existing feed UI (walletAddress, avatarUrl).
 */

export type UserRole = "user" | "admin"

export interface ApiUser {
  id: string
  walletAddress: string | null
  email?: string | null
  mobile?: string | null
  username: string | null
  name: string
  bio: string
  avatarUrl: string
  isVerified: boolean
  role?: UserRole
  createdAt?: string
  updatedAt?: string
}

/** Author shape embedded in post (frontend uses address, name, avatar). */
export interface PostAuthor {
  id: string
  address: string
  walletAddress?: string
  username?: string | null
  name: string
  avatar: string
  avatarUrl?: string
  isVerified?: boolean
}

export type ModerationStatus = "pending" | "approved" | "rejected"

export interface ApiPost {
  id: string
  content: string
  imageUrl?: string | null
  imageUrls?: string[]
  videoUrl?: string | null
  isArchived?: boolean
  createdAt: string
  updatedAt?: string
  author: PostAuthor
  /** Count of upvotes (value 1). */
  upvotes: number
  /** Count of downvotes (value -1). */
  downvotes: number
  /** Current user's vote: 1, -1, or 0 if none / logged out. */
  userVote: 1 | -1 | 0
  comments: number
  isBookmarked?: boolean
  tags?: string[]
  moderationStatus?: ModerationStatus
  reviewedAt?: string | null
  rejectionReason?: string
}

export interface ApiComment {
  id: string
  content: string
  author: PostAuthor | null
  createdAt: string
  replies?: ApiComment[]
}

export interface ApiStoryItem {
  id: string
  mediaUrl: string
  expiresAt: string
  createdAt: string
}

export interface ApiStoryGroup {
  author: PostAuthor
  stories: ApiStoryItem[]
}

export interface ApiNotification {
  id: string
  type: string
  actor: PostAuthor | null
  post: string | null
  read: boolean
  createdAt: string
}

export interface AuthResponse {
  user: ApiUser
  token: string
}

export interface PaginatedPosts {
  posts: ApiPost[]
  hasMore: boolean
}

/** GET /users/me/earnings */
export interface UserEarningsResponse {
  estimate: {
    year: number
    month: number
    ratePaisePerPoint: number
    estimatedTotalPaise: number
    estimatedTotalInr: number
    posts: { postId: string; netScore: number; amountPaise: number }[]
  }
  history: {
    periodId: string
    year: number
    month: number
    status: string
    totalPaise: number
  }[]
}

export interface PayoutPeriodRow {
  id: string
  year: number
  month: number
  status: string
  computedAt?: string
  createdAt?: string
}

export interface ClosePeriodResult {
  periodId: string
  year: number
  month: number
  postsProcessed: number
  linesCreated: number
  userTotalsPaise: Record<string, number>
}
