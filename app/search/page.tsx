"use client"

import { Suspense } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState, useCallback } from "react"
import { postsApi, searchApi } from "@/lib/api-client"
import type { ApiUser, ApiPost } from "@/lib/api-types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Search as SearchIcon, Globe } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

function SearchContent() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const q = searchParams.get("q") ?? ""
  const [query, setQuery] = useState(q)
  const [users, setUsers] = useState<ApiUser[]>([])
  const [posts, setPosts] = useState<ApiPost[]>([])
  const [hashtags, setHashtags] = useState<{ tag: string; count: number }[]>([])
  const [isHashtagPostsMode, setIsHashtagPostsMode] = useState(false)
  const [postsPage, setPostsPage] = useState(1)
  const [postsHasMore, setPostsHasMore] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingMorePosts, setLoadingMorePosts] = useState(false)

  const runSearch = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setUsers([])
      setPosts([])
      setHashtags([])
      setIsHashtagPostsMode(false)
      setPostsHasMore(false)
      return
    }
    const trimmed = searchTerm.trim()
    setLoading(true)
    try {
      if (trimmed.startsWith("#")) {
        const tag = trimmed.replace(/^#+/, "").toLowerCase().trim()
        if (!tag) {
          setUsers([])
          setPosts([])
          setHashtags([])
          setIsHashtagPostsMode(false)
          setPostsHasMore(false)
          return
        }
        const res = await postsApi.list({ tag, page: 1, limit: 20 })
        setUsers([])
        setHashtags([])
        setPosts(res.posts)
        setIsHashtagPostsMode(true)
        setPostsPage(1)
        setPostsHasMore(res.hasMore)
      } else {
        const res = await searchApi.search(trimmed)
        setUsers(res.users ?? [])
        setPosts(res.posts ?? [])
        setHashtags(res.hashtags ?? [])
        setIsHashtagPostsMode(false)
        setPostsHasMore(false)
      }
    } catch (e) {
      toast.error((e as Error).message ?? "Search failed")
      setUsers([])
      setPosts([])
      setHashtags([])
      setIsHashtagPostsMode(false)
      setPostsHasMore(false)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadMoreTagPosts = useCallback(async () => {
    const trimmed = q.trim()
    if (!trimmed.startsWith("#") || !postsHasMore || loadingMorePosts) return
    const tag = trimmed.replace(/^#+/, "").toLowerCase().trim()
    if (!tag) return
    setLoadingMorePosts(true)
    try {
      const nextPage = postsPage + 1
      const res = await postsApi.list({ tag, page: nextPage, limit: 20 })
      setPosts((prev) => [...prev, ...res.posts])
      setPostsPage(nextPage)
      setPostsHasMore(res.hasMore)
    } catch (e) {
      toast.error((e as Error).message ?? "Could not load more posts")
    } finally {
      setLoadingMorePosts(false)
    }
  }, [q, postsHasMore, postsPage, loadingMorePosts])

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/")
      return
    }
    setQuery(q)
    runSearch(q)
  }, [isAuthenticated, router, q, runSearch])

  const truncate = (s: string) => `${s.slice(0, 6)}...${s.slice(-4)}`

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center gap-4">
          <Link href="/feed" className="flex items-center gap-2 shrink-0">
            <Globe className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">civicGram</span>
          </Link>
          <form
            className="flex-1 max-w-md flex gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              router.push(`/search?q=${encodeURIComponent(query)}`)
              runSearch(query)
            }}
          >
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users, posts, hashtags..."
                className="pl-10"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Button type="submit">Search</Button>
          </form>
        </div>
      </header>
      <main className="container max-w-2xl mx-auto px-4 py-6">
        {loading ? (
          <p className="text-muted-foreground">Searching...</p>
        ) : (
          <>
            {hashtags.length > 0 && (
              <section className="mb-8">
                <h2 className="text-lg font-semibold mb-4">Hashtags</h2>
                <div className="flex flex-wrap gap-2">
                  {hashtags.map((h) => (
                    <Link key={h.tag} href={`/search?q=${encodeURIComponent(`#${h.tag}`)}`}>
                      <Button variant="secondary" size="sm" className="rounded-full" type="button">
                        #{h.tag}
                        <span className="text-muted-foreground ml-1.5 tabular-nums">{h.count}</span>
                      </Button>
                    </Link>
                  ))}
                </div>
              </section>
            )}
            {users.length > 0 && (
              <section className="mb-8">
                <h2 className="text-lg font-semibold mb-4">Users</h2>
                <div className="space-y-2">
                  {users.map((u) => (
                    <Link key={u.id} href={`/profile/${u.id}`}>
                      <Card className="hover:bg-muted/50 transition-colors">
                        <CardContent className="flex items-center gap-3 py-3">
                          <Avatar>
                            <AvatarImage src={u.avatarUrl} />
                            <AvatarFallback>
                              {(u.name || u.username || u.email || u.mobile || u.walletAddress || "?").slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {u.name || u.username || u.email || u.mobile || (u.walletAddress ? truncate(u.walletAddress) : "—")}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {u.username ? `@${u.username}` : u.email ?? u.mobile ?? (u.walletAddress ? truncate(u.walletAddress) : "—")}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            )}
            {posts.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold mb-4">
                  {isHashtagPostsMode ? `Posts with ${query.trim()}` : "Posts"}
                </h2>
                <div className="space-y-4">
                  {posts.map((p) => (
                    <Card key={p.id}>
                      <CardContent className="pt-4">
                        <p className="whitespace-pre-line">{p.content}</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          {(p.author as { name?: string }).name || truncate((p.author as { address?: string }).address ?? "")} · {p.likes} likes
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {isHashtagPostsMode && postsHasMore && (
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-4 w-full"
                    disabled={loadingMorePosts}
                    onClick={() => void loadMoreTagPosts()}
                  >
                    {loadingMorePosts ? "Loading…" : "Load more"}
                  </Button>
                )}
              </section>
            )}
            {!loading &&
              query.trim() &&
              users.length === 0 &&
              posts.length === 0 &&
              hashtags.length === 0 && (
              <p className="text-muted-foreground">No results found.</p>
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}
