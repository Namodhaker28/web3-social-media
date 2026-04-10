/**
 * API client for civicGram backend.
 * Uses NEXT_PUBLIC_API_URL and optional Bearer token from auth store.
 */

import type {
  AuthResponse,
  ApiPost,
  ApiUser,
  ApiComment,
  PaginatedPosts,
  ApiStoryGroup,
  ApiStoryItem,
  ApiNotification,
  PostAuthor,
} from "./api-types"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"

let authToken: string | null =
  typeof window !== "undefined" ? localStorage.getItem("decentsocial_token") : null

export function getAuthToken(): string | null {
  return authToken
}

export function setAuthToken(token: string | null): void {
  authToken = token
  if (typeof window !== "undefined") {
    if (token) localStorage.setItem("decentsocial_token", token)
    else localStorage.removeItem("decentsocial_token")
  }
}

/** Login/register 401 means bad credentials — never redirect those to /login. */
const AUTH_CREDENTIAL_PATHS = new Set(["/auth/login", "/auth/register"])

/**
 * Clears session and sends the browser to login when the API rejects the session.
 * No-op on server and for credential endpoints (wrong password, etc.).
 */
function redirectToLoginOnUnauthorized(requestPath: string): void {
  if (typeof window === "undefined") return
  const pathOnly = requestPath.split("?")[0]
  if (AUTH_CREDENTIAL_PATHS.has(pathOnly)) return
  setAuthToken(null)
  if (window.location.pathname === "/login") return
  window.location.assign("/login")
}

/** Extract user-facing message from API error body or status. */
function getErrorMessage(
  body: { error?: string | Record<string, string[]> },
  status: number
): string {
  const err = body?.error
  if (typeof err === "string" && err.trim()) return err.trim()
  if (err && typeof err === "object" && !Array.isArray(err)) {
    const first = Object.values(err).flat().filter(Boolean)[0]
    if (typeof first === "string") return first
  }
  if (status === 401) return "Please log in again"
  if (status === 403) return "You don't have permission to do that"
  if (status === 404) return "Not found"
  if (status >= 500) return "Server error. Try again later"
  return "Something went wrong"
}

async function request<T>(
  path: string,
  options: RequestInit & { params?: Record<string, string> } = {}
): Promise<T> {
  const { params, ...init } = options
  const url = new URL(path, BASE_URL)
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  }
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  }
  if (authToken) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${authToken}`
  }
  const res = await fetch(url.toString(), { ...init, headers })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    if (res.status === 401) redirectToLoginOnUnauthorized(path)
    const message = getErrorMessage(body as { error?: string | Record<string, string[]> }, res.status)
    throw new Error(message)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

async function requestMultipart<T>(
  path: string,
  method: string,
  body: FormData
): Promise<T> {
  const url = new URL(path, BASE_URL)
  const headers: HeadersInit = {}
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`
  }
  const res = await fetch(url.toString(), { method, body, headers })
  if (!res.ok) {
    const apiBody = await res.json().catch(() => ({}))
    if (res.status === 401) redirectToLoginOnUnauthorized(path)
    const message = getErrorMessage(apiBody as { error?: string | Record<string, string[]> }, res.status)
    throw new Error(message)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

/** Auth */
export const authApi = {
  login: (credentials: { email?: string; mobile?: string; password: string }) =>
    request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),
  register: (credentials: {
    name: string
    email?: string
    mobile?: string
    password: string
  }) =>
    request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),
}

/** Users */
export const usersApi = {
  getMe: () => request<ApiUser>("/users/me"),
  getById: (id: string) => request<ApiUser>(`/users/${id}`),
  getByUsername: (username: string) =>
    request<ApiUser>(`/users/by-username/${encodeURIComponent(username)}`),
  updateMe: (data: { name?: string; username?: string | null; bio?: string; avatarUrl?: string }) =>
    request<ApiUser>("/users/me", { method: "PATCH", body: JSON.stringify(data) }),
  /** Upload profile photo to Cloudinary (`civic-social/profiles/avatars`); returns updated user. */
  uploadAvatar: (file: File) => {
    const form = new FormData()
    form.append("avatar", file)
    return requestMultipart<ApiUser>("/users/me/avatar", "POST", form)
  },
  getSuggestions: (limit?: number) =>
    request<ApiUser[]>(`/users/suggestions${limit != null ? `?limit=${limit}` : ""}`),
}

/** Feed */
export const feedApi = {
  forYou: (page = 1, limit = 20) =>
    request<PaginatedPosts>(`/feed/for-you?page=${page}&limit=${limit}`),
  following: (page = 1, limit = 20) =>
    request<PaginatedPosts>(`/feed/following?page=${page}&limit=${limit}`),
}

/** Posts */
export const postsApi = {
  list: (params?: { authorId?: string; tag?: string; page?: number; limit?: number }) => {
    const search = new URLSearchParams()
    if (params?.authorId) search.set("authorId", params.authorId)
    if (params?.tag) search.set("tag", params.tag)
    if (params?.page != null) search.set("page", String(params.page))
    if (params?.limit != null) search.set("limit", String(params.limit))
    return request<PaginatedPosts>(`/posts?${search}`)
  },
  getById: (id: string) => request<ApiPost>(`/posts/${id}`),
  create: (content: string, images?: File[], video?: File) => {
    const form = new FormData()
    form.set("content", content)
    images?.forEach((f) => form.append("images", f))
    if (video) form.append("video", video)
    return requestMultipart<ApiPost>("/posts", "POST", form)
  },
  update: (id: string, content: string) =>
    request<ApiPost>(`/posts/${id}`, { method: "PATCH", body: JSON.stringify({ content }) }),
  delete: (id: string) => request<void>(`/posts/${id}`, { method: "DELETE" }),
  archive: (id: string) => request<{ archived: boolean }>(`/posts/${id}/archive`, { method: "POST" }),
  unarchive: (id: string) =>
    request<{ archived: boolean }>(`/posts/${id}/unarchive`, { method: "POST" }),
  like: (postId: string) =>
    request<{ liked: boolean; likesCount: number }>(`/posts/${postId}/like`, { method: "POST" }),
  unlike: (postId: string) =>
    request<{ liked: boolean; likesCount: number }>(`/posts/${postId}/like`, { method: "DELETE" }),
  bookmark: (postId: string) =>
    request<{ bookmarked: boolean }>(`/posts/${postId}/bookmark`, { method: "POST" }),
  unbookmark: (postId: string) =>
    request<{ bookmarked: boolean }>(`/posts/${postId}/bookmark`, { method: "DELETE" }),
}

/** Comments */
export const commentsApi = {
  list: (postId: string) => request<ApiComment[]>(`/posts/${postId}/comments`),
  create: (postId: string, content: string, parentId?: string | null) =>
    request<ApiComment>(`/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify({ content, parentId: parentId ?? undefined }),
    }),
}

/** Follow */
export const followApi = {
  follow: (userId: string) =>
    request<{ following: boolean }>(`/users/${userId}/follow`, { method: "POST" }),
  unfollow: (userId: string) =>
    request<{ following: boolean }>(`/users/${userId}/follow`, { method: "DELETE" }),
  followers: (userId: string) => request<ApiUser[]>(`/users/${userId}/followers`),
  following: (userId: string) => request<ApiUser[]>(`/users/${userId}/following`),
}

/** Bookmarks */
export const bookmarksApi = {
  list: (page = 1, limit = 20) =>
    request<PaginatedPosts>(`/bookmarks?page=${page}&limit=${limit}`),
}

/** Notifications */
export const notificationsApi = {
  list: (page = 1, limit = 30) =>
    request<{ notifications: ApiNotification[]; hasMore: boolean }>(
      `/notifications?page=${page}&limit=${limit}`
    ),
  markRead: (id: string) =>
    request<{ read: boolean }>(`/notifications/${id}/read`, { method: "PATCH" }),
  markAllRead: () => request<{ read: boolean }>("/notifications/read-all", { method: "PATCH" }),
}

/** Search */
export const searchApi = {
  search: (q: string, type?: "users" | "posts" | "hashtags") => {
    const params = new URLSearchParams({ q })
    if (type) params.set("type", type)
    return request<{ users?: ApiUser[]; posts?: ApiPost[]; hashtags?: { tag: string; count: number }[] }>(
      `/search?${params}`
    )
  },
}

/** Trending */
export const trendingApi = {
  tags: (limit?: number) =>
    request<{ tag: string; count: number }[]>(`/trending/tags${limit != null ? `?limit=${limit}` : ""}`),
  posts: (limit?: number) =>
    request<ApiPost[]>(`/trending/posts${limit != null ? `?limit=${limit}` : ""}`),
}

/** Stories */
export const storiesApi = {
  list: () => request<ApiStoryGroup[]>("/stories"),
  getByUser: (userId: string) =>
    request<{ author: PostAuthor; stories: ApiStoryItem[] }>(`/stories/${userId}`),
  create: (file: File) => {
    const form = new FormData()
    form.append("media", file)
    return requestMultipart<{ id: string; mediaUrl: string; expiresAt: string; createdAt: string }>(
      "/stories",
      "POST",
      form
    )
  },
  delete: (id: string) => request<void>(`/stories/${id}`, { method: "DELETE" }),
}

/** Block / Report */
export const blockApi = {
  block: (userId: string) =>
    request<{ blocked: boolean }>(`/users/${userId}/block`, { method: "POST" }),
  unblock: (userId: string) =>
    request<{ blocked: boolean }>(`/users/${userId}/unblock`, { method: "DELETE" }),
  listBlocked: () => request<ApiUser[]>("/users/me/blocked"),
}

export const reportApi = {
  report: (targetType: "post" | "user", targetId: string, reason?: string) =>
    request<{ reported: boolean }>("/report", {
      method: "POST",
      body: JSON.stringify({ targetType, targetId, reason }),
    }),
}

/** Archived posts */
export const archivedApi = {
  list: (page = 1, limit = 20) =>
    request<PaginatedPosts>(`/users/me/posts/archived?page=${page}&limit=${limit}`),
}
