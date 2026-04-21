"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { adminApi, usersApi } from "@/lib/api-client"
import type { ApiPost, ApiUser } from "@/lib/api-types"
import { normalizePost } from "@/lib/normalize-post"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Globe, Loader2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { PostImages } from "@/components/post-images"
import { toast } from "sonner"

/** Admin queue: approve or reject pending posts. */
export default function AdminModerationPage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const [me, setMe] = useState<ApiUser | null>(null)
  const [posts, setPosts] = useState<(ApiPost & { timestamp: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectPostId, setRejectPostId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [user, res] = await Promise.all([usersApi.getMe(), adminApi.moderationPending(1, 50)])
      setMe(user)
      if (user.role !== "admin") {
        toast.error("Admin access required")
        router.push("/feed")
        return
      }
      setPosts(res.posts.map(normalizePost))
    } catch (e) {
      toast.error((e as Error).message ?? "Failed to load queue")
      setPosts([])
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/")
      return
    }
    void load()
  }, [isAuthenticated, router, load])

  const handleApprove = async (id: string) => {
    setActionId(id)
    try {
      await adminApi.approvePost(id)
      toast.success("Post approved")
      setPosts((prev) => prev.filter((p) => p.id !== id))
    } catch (e) {
      toast.error((e as Error).message ?? "Approve failed")
    } finally {
      setActionId(null)
    }
  }

  const openReject = (id: string) => {
    setRejectPostId(id)
    setRejectReason("")
    setRejectOpen(true)
  }

  const handleRejectConfirm = async () => {
    if (!rejectPostId) return
    setActionId(rejectPostId)
    try {
      await adminApi.rejectPost(rejectPostId, rejectReason)
      toast.success("Post rejected")
      setPosts((prev) => prev.filter((p) => p.id !== rejectPostId))
      setRejectOpen(false)
      setRejectPostId(null)
    } catch (e) {
      toast.error((e as Error).message ?? "Reject failed")
    } finally {
      setActionId(null)
    }
  }

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/feed" className="flex items-center gap-2">
            <Globe className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">civicGram</span>
          </Link>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/payouts">Payouts</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/feed">Feed</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="container max-w-2xl mx-auto px-4 py-8 space-y-6">
        <h1 className="text-2xl font-bold">Moderation queue</h1>
        {me && me.role !== "admin" && (
          <p className="text-destructive text-sm">You do not have admin access.</p>
        )}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : posts.length === 0 ? (
          <p className="text-muted-foreground">No posts pending review.</p>
        ) : (
          posts.map((post) => (
            <Card key={post.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage
                      src={post.author.avatar || (post.author as { avatarUrl?: string }).avatarUrl}
                      alt={post.author.name}
                    />
                    <AvatarFallback>{(post.author.name || "?").slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">{post.author.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(post.timestamp), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line">{post.content}</p>
                {post.videoUrl && (
                  <video src={post.videoUrl} controls className="mt-3 w-full max-h-96 rounded-lg" />
                )}
                <PostImages videoUrl={post.videoUrl} imageUrls={post.imageUrls} imageUrl={post.imageUrl} />
              </CardContent>
              <CardFooter className="flex gap-2 border-t pt-3">
                <Button
                  size="sm"
                  onClick={() => handleApprove(post.id)}
                  disabled={actionId === post.id}
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => openReject(post.id)}
                  disabled={actionId === post.id}
                >
                  Reject
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </main>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject post</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Reason (shown to the author)"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRejectConfirm} disabled={!!actionId}>
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
