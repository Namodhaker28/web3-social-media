/**
 * API types aligned with backend responses.
 * author.address / author.avatar match existing feed UI (walletAddress, avatarUrl).
 */

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
  likes: number
  comments: number
  hasLiked: boolean
  isBookmarked?: boolean
  tags?: string[]
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
