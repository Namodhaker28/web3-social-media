"use client"

import { PostImages } from "@/components/post-images"
import { useAuth } from "@/components/auth-provider"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { usersApi, postsApi, followApi } from "@/lib/api-client"
import type { ApiUser, ApiPost } from "@/lib/api-types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Globe, BadgeCheck } from "lucide-react"
import { ModerationBadge } from "@/components/moderation-badge"
import Link from "next/link"
import { format } from "date-fns"
import { toast } from "sonner"

export default function ProfileByIdPage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [user, setUser] = useState<ApiUser | null>(null)
  const [currentUser, setCurrentUser] = useState<ApiUser | null>(null)
  const [posts, setPosts] = useState<ApiPost[]>([])
  const [loading, setLoading] = useState(true)
  const [followLoading, setFollowLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/")
      return
    }
    let cancelled = false
    async function load() {
      try {
        const [u, res, me] = await Promise.all([
          usersApi.getById(id),
          postsApi.list({ authorId: id, limit: 30 }),
          usersApi.getMe(),
        ])
        if (cancelled) return
        setUser(u)
        setCurrentUser(me)
        setPosts(res.posts)
      } catch (e) {
        if (!cancelled) {
          toast.error((e as Error).message ?? "Failed to load profile")
          setUser(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [isAuthenticated, router, id])

  const handleFollow = async () => {
    setFollowLoading(true)
    try {
      await followApi.follow(id)
    } catch (e) {
      toast.error((e as Error).message ?? "Failed to follow")
    } finally {
      setFollowLoading(false)
    }
  }

  if (!isAuthenticated) return null
  if (loading) return <div className="container py-12 text-center text-muted-foreground">Loading...</div>
  if (!user) return <div className="container py-12 text-center">User not found.</div>

  const truncate = (s: string) => `${s.slice(0, 6)}...${s.slice(-4)}`
  const isOwnProfile = currentUser && user.id === currentUser.id
  const displayName = user.name || user.username || user.email || user.mobile || user.walletAddress || "—"
  const handleOrHandle = user.username ? `@${user.username}` : user.email ?? user.mobile ?? (user.walletAddress ? truncate(user.walletAddress) : "—")

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/feed" className="flex items-center gap-2">
            <Globe className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">civicGram</span>
          </Link>
        </div>
      </header>
      <main className="container max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4 pb-0">
            <div className="flex flex-row items-start gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.avatarUrl || undefined} />
                <AvatarFallback>{(user.name || user.walletAddress || user.email || "?").slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">{displayName}</h1>
                  {user.isVerified && <BadgeCheck className="h-5 w-5 text-primary" />}
                </div>
                <p className="text-muted-foreground">{handleOrHandle}</p>
                {user.bio && <p className="mt-2 text-sm">{user.bio}</p>}
                {user.createdAt && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Joined {format(new Date(user.createdAt), "MMM d, yyyy")}
                  </p>
                )}
              </div>
            </div>
            {!isOwnProfile && (
              <Button onClick={handleFollow} disabled={followLoading}>
                {followLoading ? "..." : "Follow"}
              </Button>
            )}
          </CardHeader>
        </Card>
        <h2 className="text-lg font-semibold mt-8 mb-4">Posts</h2>
        {posts.length === 0 ? (
          <p className="text-muted-foreground">No posts yet.</p>
        ) : (
          <div className="space-y-4">
            {posts.map((p) => (
              <Card key={p.id}>
                <CardContent className="pt-4 space-y-2">
                  <ModerationBadge status={p.moderationStatus} rejectionReason={p.rejectionReason} />
                  <p className="whitespace-pre-line">{p.content}</p>
                  {p.videoUrl && (
                    <video src={p.videoUrl} controls className="mt-3 w-full max-h-96 rounded-lg" />
                  )}
                  <PostImages
                    videoUrl={p.videoUrl}
                    imageUrls={p.imageUrls}
                    imageUrl={p.imageUrl}
                    variant="compact"
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    {p.upvotes}↑ · {p.downvotes}↓ · {p.comments} comments
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
