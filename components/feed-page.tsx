"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { ConnectButton } from "@/components/connect-button"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bell,
  Globe,
  Heart,
  Home,
  Image,
  MessageCircle,
  MoreHorizontal,
  PenSquare,
  Search,
  Share2,
  User,
  Video,
  X,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { feedApi, postsApi, usersApi, followApi, trendingApi } from "@/lib/api-client"
import { PostImages } from "@/components/post-images"
import { normalizePost } from "@/lib/normalize-post"
import type { ApiPost, ApiUser } from "@/lib/api-types"
import Link from "next/link"
import { toast } from "sonner"

export function FeedPage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const [posts, setPosts] = useState<(ApiPost & { timestamp: string })[]>([])
  const [followingPosts, setFollowingPosts] = useState<(ApiPost & { timestamp: string })[]>([])
  const [trendingPosts, setTrendingPosts] = useState<(ApiPost & { timestamp: string })[]>([])
  const [suggestions, setSuggestions] = useState<ApiUser[]>([])
  const [trendingTags, setTrendingTags] = useState<{ tag: string; count: number }[]>([])
  const [newPostContent, setNewPostContent] = useState("")
  const [newPostImages, setNewPostImages] = useState<File[]>([])
  const [newPostVideo, setNewPostVideo] = useState<File | null>(null)
  const [isCreatingPost, setIsCreatingPost] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(true)
  const [loadingFollowing, setLoadingFollowing] = useState(false)
  const [loadingTrending, setLoadingTrending] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [likeLoadingId, setLikeLoadingId] = useState<string | null>(null)

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isAuthenticated && typeof window !== "undefined") {
      router.push("/")
    }
  }, [isAuthenticated, router])

  // Fetch For You feed and suggestions when authenticated
  const fetchFeed = useCallback(async () => {
    if (!isAuthenticated) return
    setLoading(true)
    try {
      const [res, sug, tagsRes] = await Promise.all([
        feedApi.forYou(1, 20),
        usersApi.getSuggestions(5),
        trendingApi.tags(8),
      ])
      setPosts(res.posts.map(normalizePost))
      setSuggestions(sug)
      setTrendingTags(tagsRes)
    } catch (e) {
      toast.error((e as Error).message ?? "Failed to load feed")
      setPosts([])
      setTrendingTags([])
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    fetchFeed()
  }, [fetchFeed])

  const fetchFollowing = useCallback(async () => {
    setLoadingFollowing(true)
    try {
      const res = await feedApi.following(1, 20)
      setFollowingPosts(res.posts.map(normalizePost))
    } catch (e) {
      toast.error((e as Error).message ?? "Failed to load")
      setFollowingPosts([])
    } finally {
      setLoadingFollowing(false)
    }
  }, [])

  const fetchTrending = useCallback(async () => {
    setLoadingTrending(true)
    try {
      const [postsRes, tagsRes] = await Promise.all([
        trendingApi.posts(15),
        trendingApi.tags(8),
      ])
      setTrendingPosts(postsRes.map(normalizePost))
      setTrendingTags(tagsRes)
    } catch (e) {
      toast.error((e as Error).message ?? "Failed to load trending")
      setTrendingPosts([])
      setTrendingTags([])
    } finally {
      setLoadingTrending(false)
    }
  }, [])

  /** Submits the compose dialog and prepends the new post to the For You feed. */
  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return
    setCreateLoading(true)
    try {
      const created = await postsApi.create(
        newPostContent,
        newPostImages.length > 0 ? newPostImages : undefined,
        newPostVideo ?? undefined
      )
      setPosts((prev) => [normalizePost(created), ...prev])
      setNewPostContent("")
      setNewPostImages([])
      setNewPostVideo(null)
      setIsCreatingPost(false)
      toast.success("Post created")
    } catch (e) {
      toast.error((e as Error).message ?? "Failed to create post")
    } finally {
      setCreateLoading(false)
    }
  }

  const handleLike = async (postId: string) => {
    setLikeLoadingId(postId)
    try {
      const res = await postsApi.like(postId)
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, hasLiked: res.liked, likes: res.likesCount }
            : p
        )
      )
      setFollowingPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, hasLiked: res.liked, likes: res.likesCount }
            : p
        )
      )
      setTrendingPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, hasLiked: res.liked, likes: res.likesCount }
            : p
        )
      )
    } catch (e) {
      toast.error((e as Error).message ?? "Failed to update like")
    } finally {
      setLikeLoadingId(null)
    }
  }

  const handleFollow = async (userId: string) => {
    try {
      await followApi.follow(userId)
      setSuggestions((prev) => prev.filter((u) => u.id !== userId))
      toast.success("Following")
    } catch (e) {
      toast.error((e as Error).message ?? "Failed to follow")
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Globe className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">civicGram</h1>
          </div>
          <form
            className="hidden md:flex items-center gap-4"
            onSubmit={(e) => {
              e.preventDefault()
              const el = (e.currentTarget.elements.namedItem("q") as HTMLInputElement | null)
              const term = el?.value?.trim() ?? ""
              if (!term) {
                router.push("/search")
                return
              }
              router.push(`/search?q=${encodeURIComponent(term)}`)
            }}
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                name="q"
                placeholder="Search..."
                className="pl-10 w-[250px]"
                aria-label="Search"
              />
            </div>
            <Button type="submit" size="sm" variant="secondary">
              Search
            </Button>
          </form>
          <div className="flex items-center gap-3">
            <ModeToggle />
            <ConnectButton showBalance={false} />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Sidebar - Desktop */}
        <aside className="hidden md:block md:col-span-3 lg:col-span-2">
          <div className="sticky top-24 space-y-2">
            <Button variant="ghost" className="w-full justify-start" size="lg" asChild>
              <Link href="/feed">
                <Home className="mr-2 h-5 w-5" />
                Home
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" size="lg" asChild>
              <Link href="/profile">
                <User className="mr-2 h-5 w-5" />
                Profile
              </Link>
            </Button>
            <Button
              variant="default"
              className="w-full justify-start mt-4"
              size="lg"
              onClick={() => setIsCreatingPost(true)}
            >
              <PenSquare className="mr-2 h-5 w-5" />
              Create Post
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="md:col-span-9 lg:col-span-7">
          {trendingTags.length > 0 && (
            <div className="lg:hidden mb-4 rounded-lg border border-border bg-card p-4">
              <h3 className="text-sm font-semibold mb-3">Trending topics</h3>
              <div className="flex flex-wrap gap-2">
                {trendingTags.map((t) => (
                  <Link
                    key={t.tag}
                    href={`/search?q=${encodeURIComponent(`#${t.tag}`)}`}
                    className="text-sm text-primary hover:underline"
                  >
                    #{t.tag}
                    {t.count > 0 && (
                      <span className="text-muted-foreground ml-1 tabular-nums">({t.count})</span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}
          <Tabs
            defaultValue="foryou"
            onValueChange={(value) => {
              // Load tab data when selected — avoid onFocus on TabsContent (focus bubbles from
              // carousel/video controls and would refetch, remount media, and feel like a full reload).
              if (value === "following") void fetchFollowing()
              if (value === "trending") void fetchTrending()
            }}
          >
            <TabsList className="w-full mb-6">
              <TabsTrigger value="foryou" className="flex-1">
                For You
              </TabsTrigger>
              <TabsTrigger value="following" className="flex-1">
                Following
              </TabsTrigger>
              <TabsTrigger value="trending" className="flex-1">
                Trending
              </TabsTrigger>
            </TabsList>

            <TabsContent value="foryou" className="space-y-6 mt-0">
              {loading ? (
                <div className="text-center py-12 text-muted-foreground">Loading feed...</div>
              ) : posts.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
                  <p className="text-muted-foreground">Create a post or follow others to see content here.</p>
                </div>
              ) : (
                posts.map((post) => (
                  <Card key={post.id}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={post.author.avatar || (post.author as { avatarUrl?: string }).avatarUrl} alt={post.author.name} />
                            <AvatarFallback>{(post.author.name || "?").slice(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold">{post.author.name || truncateAddress(post.author.address)}</div>
                            <div className="text-sm text-muted-foreground">
                              {post.author.username ? `@${post.author.username}` : truncateAddress(post.author.address)} ·{" "}
                              {formatDistanceToNow(new Date(post.timestamp), { addSuffix: true })}
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="whitespace-pre-line">{post.content}</p>
                      {post.videoUrl && (
                        <video
                          src={post.videoUrl}
                          controls
                          className="mt-3 w-full max-h-96 rounded-lg"
                        />
                      )}
                      <PostImages
                        videoUrl={post.videoUrl}
                        imageUrls={post.imageUrls}
                        imageUrl={post.imageUrl}
                      />
                    </CardContent>
                    <CardFooter className="border-t pt-3">
                      <div className="flex justify-between w-full">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLike(post.id)}
                          disabled={likeLoadingId === post.id}
                          className={post.hasLiked ? "text-red-500" : ""}
                        >
                          <Heart className={`h-5 w-5 mr-2 ${post.hasLiked ? "fill-current" : ""}`} />
                          {post.likes}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MessageCircle className="h-5 w-5 mr-2" />
                          {post.comments}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share2 className="h-5 w-5 mr-2" />
                          Share
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="following" className="space-y-6 mt-0">
              {loadingFollowing ? (
                <div className="text-center py-12 text-muted-foreground">Loading...</div>
              ) : followingPosts.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
                  <p className="text-muted-foreground">Follow some accounts to see their posts here.</p>
                </div>
              ) : (
                followingPosts.map((post) => (
                  <Card key={post.id}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={post.author.avatar || (post.author as { avatarUrl?: string }).avatarUrl} alt={post.author.name} />
                            <AvatarFallback>{(post.author.name || "?").slice(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold">{post.author.name || truncateAddress(post.author.address)}</div>
                            <div className="text-sm text-muted-foreground">
                              {formatDistanceToNow(new Date(post.timestamp), { addSuffix: true })}
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="whitespace-pre-line">{post.content}</p>
                      {post.videoUrl && (
                        <video src={post.videoUrl} controls className="mt-3 w-full max-h-96 rounded-lg" />
                      )}
                      <PostImages
                        videoUrl={post.videoUrl}
                        imageUrls={post.imageUrls}
                        imageUrl={post.imageUrl}
                      />
                    </CardContent>
                    <CardFooter className="border-t pt-3">
                      <div className="flex justify-between w-full">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLike(post.id)}
                          disabled={likeLoadingId === post.id}
                          className={post.hasLiked ? "text-red-500" : ""}
                        >
                          <Heart className={`h-5 w-5 mr-2 ${post.hasLiked ? "fill-current" : ""}`} />
                          {post.likes}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MessageCircle className="h-5 w-5 mr-2" />
                          {post.comments}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share2 className="h-5 w-5 mr-2" />
                          Share
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="trending" className="space-y-6 mt-0">
              {loadingTrending ? (
                <div className="text-center py-12 text-muted-foreground">Loading trending...</div>
              ) : (
                <>
                  {trendingPosts.length > 0 && (
                    <div className="space-y-6">
                      {trendingPosts.map((post) => (
                        <Card key={post.id}>
                          <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarImage src={post.author.avatar || (post.author as { avatarUrl?: string }).avatarUrl} alt={post.author.name} />
                                  <AvatarFallback>{(post.author.name || "?").slice(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-semibold">{post.author.name || truncateAddress(post.author.address)}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {formatDistanceToNow(new Date(post.timestamp), { addSuffix: true })}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="whitespace-pre-line">{post.content}</p>
                            {post.videoUrl && (
                              <video src={post.videoUrl} controls className="mt-3 w-full max-h-96 rounded-lg" />
                            )}
                            <PostImages
                              videoUrl={post.videoUrl}
                              imageUrls={post.imageUrls}
                              imageUrl={post.imageUrl}
                            />
                          </CardContent>
                          <CardFooter className="border-t pt-3">
                            <div className="flex justify-between w-full">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleLike(post.id)}
                                disabled={likeLoadingId === post.id}
                                className={post.hasLiked ? "text-red-500" : ""}
                              >
                                <Heart className={`h-5 w-5 mr-2 ${post.hasLiked ? "fill-current" : ""}`} />
                                {post.likes}
                              </Button>
                              <Button variant="ghost" size="sm">
                                <MessageCircle className="h-5 w-5 mr-2" />
                                {post.comments}
                              </Button>
                            </div>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  )}
                  {trendingPosts.length === 0 && trendingTags.length === 0 && (
                    <div className="text-center py-12">
                      <h3 className="text-xl font-semibold mb-2">No trending content yet</h3>
                      <p className="text-muted-foreground">Check back later.</p>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </main>

        {/* Right Sidebar - Desktop */}
        <aside className="hidden lg:block lg:col-span-3">
          <div className="sticky top-24 space-y-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Who to follow</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                {suggestions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No suggestions right now.</p>
                ) : (
                  suggestions.map((u) => (
                    <div key={u.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={u.avatarUrl} />
                          <AvatarFallback>
                            {(u.name || u.username || u.email || u.mobile || u.walletAddress || "?").slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {u.name || u.username || u.email || u.mobile || (u.walletAddress ? truncateAddress(u.walletAddress) : "—")}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {u.username ? `@${u.username}` : u.email ?? u.mobile ?? (u.walletAddress ? truncateAddress(u.walletAddress) : "—")}
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleFollow(u.id)}>
                        Follow
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Trending Topics</h3>
              </CardHeader>
              <CardContent className="space-y-2">
                {trendingTags.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No trending tags yet.</p>
                ) : (
                  trendingTags.map((t) => (
                    <div key={t.tag} className="text-sm">
                      <Link
                        href={`/search?q=${encodeURIComponent(`#${t.tag}`)}`}
                        className="text-primary hover:underline"
                      >
                        #{t.tag}
                      </Link>
                      {t.count > 0 && (
                        <span className="text-muted-foreground ml-1 tabular-nums">({t.count})</span>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </aside>
      </div>

      <Dialog open={isCreatingPost} onOpenChange={setIsCreatingPost}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Create a new post</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-start gap-3">
              <Avatar>
                <AvatarFallback>AN</AvatarFallback>
              </Avatar>
              <Textarea
                placeholder="What's on your mind?"
                className="flex-1 resize-none"
                rows={5}
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
              />
            </div>
            {(newPostImages.length > 0 || newPostVideo) && (
              <div className="space-y-2 border rounded-lg p-3 bg-muted/50">
                {newPostVideo && (
                  <div className="relative inline-block">
                    <video
                      src={URL.createObjectURL(newPostVideo)}
                      controls
                      className="max-h-40 rounded"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6"
                      onClick={() => setNewPostVideo(null)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                {newPostImages.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {newPostImages.map((f, i) => (
                      <div key={i} className="relative">
                        <img
                          src={URL.createObjectURL(f)}
                          alt=""
                          className="h-20 w-20 object-cover rounded"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute -top-1 -right-1 h-5 w-5"
                          onClick={() =>
                            setNewPostImages((prev) => prev.filter((_, j) => j !== i))
                          }
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files ?? [])
                    setNewPostImages((prev) => [...prev, ...files])
                    e.target.value = ""
                  }}
                />
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) {
                      setNewPostVideo(f)
                      setNewPostImages([])
                    }
                    e.target.value = ""
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={!!newPostVideo}
                >
                  <Image className="h-4 w-4 mr-2" />
                  Add Image
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => videoInputRef.current?.click()}
                  disabled={newPostImages.length > 0}
                >
                  <Video className="h-4 w-4 mr-2" />
                  Add Video
                </Button>
              </div>
              <Button onClick={handleCreatePost} disabled={!newPostContent.trim() || createLoading}>
                {createLoading ? "Posting..." : "Post"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border bg-background z-10">
        <div className="flex justify-around py-2">
          <Button variant="ghost" size="icon">
            <Home className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link href="/search">
              <Search className="h-6 w-6" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setIsCreatingPost(true)}>
            <PenSquare className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon">
            <Bell className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link href="/profile">
              <User className="h-6 w-6" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

