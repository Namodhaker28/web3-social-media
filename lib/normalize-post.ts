import type { ApiPost, PostAuthor } from "./api-types"

/** Normalize API post for feed UI (author.address, author.avatar, timestamp). */
export function normalizePost(post: ApiPost): ApiPost & { timestamp: string } {
  const author = post.author as PostAuthor & { walletAddress?: string; avatarUrl?: string }
  return {
    ...post,
    timestamp: post.createdAt,
    author: {
      ...author,
      address: author.address ?? author.walletAddress ?? "",
      avatar: author.avatar ?? author.avatarUrl ?? "",
    },
  }
}
