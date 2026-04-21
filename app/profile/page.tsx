"use client"

import { PostImages } from "@/components/post-images"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { usersApi, postsApi } from "@/lib/api-client"
import type { ApiUser, ApiPost } from "@/lib/api-types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Globe, Pencil, BadgeCheck } from "lucide-react"
import { ModerationBadge } from "@/components/moderation-badge"
import Link from "next/link"
import { format } from "date-fns"
import { toast } from "sonner"

export default function ProfilePage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const [user, setUser] = useState<ApiUser | null>(null)
  const [posts, setPosts] = useState<ApiPost[]>([])
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [editName, setEditName] = useState("")
  const [editUsername, setEditUsername] = useState("")
  const [editBio, setEditBio] = useState("")
  const [editAvatarUrl, setEditAvatarUrl] = useState("")
  /** Local file chosen in the editor; uploaded on save via Cloudinary. */
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/")
      return
    }
    let cancelled = false
    async function load() {
      try {
        const me = await usersApi.getMe()
        if (cancelled) return
        setUser(me)
        setEditName(me.name ?? "")
        setEditUsername(me.username ?? "")
        setEditBio(me.bio ?? "")
        setEditAvatarUrl(me.avatarUrl ?? "")
        const res = await postsApi.list({ authorId: me.id, limit: 30 })
        if (cancelled) return
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
  }, [isAuthenticated, router])

  // Revoke blob preview URLs when replaced or unmounted
  useEffect(() => {
    return () => {
      if (avatarPreviewUrl?.startsWith("blob:")) URL.revokeObjectURL(avatarPreviewUrl)
    }
  }, [avatarPreviewUrl])

  const resetAvatarPicker = () => {
    if (avatarPreviewUrl?.startsWith("blob:")) URL.revokeObjectURL(avatarPreviewUrl)
    setAvatarFile(null)
    setAvatarPreviewUrl(null)
    if (avatarInputRef.current) avatarInputRef.current.value = ""
  }

  const onAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (avatarPreviewUrl?.startsWith("blob:")) URL.revokeObjectURL(avatarPreviewUrl)
    setAvatarFile(file)
    setAvatarPreviewUrl(URL.createObjectURL(file))
  }

  const handleEditSubmit = async () => {
    if (!user) return
    setEditLoading(true)
    try {
      const uploadedNewAvatar = Boolean(avatarFile)
      if (avatarFile) {
        await usersApi.uploadAvatar(avatarFile)
        resetAvatarPicker()
      }
      const normalizedUsername = editUsername.replace(/^@+/, "").trim().toLowerCase()
      const updated = await usersApi.updateMe({
        name: editName || undefined,
        username: normalizedUsername || null,
        bio: editBio || undefined,
        ...(uploadedNewAvatar
          ? {}
          : { avatarUrl: editAvatarUrl.trim() === "" ? "" : editAvatarUrl.trim() || undefined }),
      })
      setUser(updated)
      setEditName(updated.name ?? "")
      setEditUsername(updated.username ?? "")
      setEditBio(updated.bio ?? "")
      setEditAvatarUrl(updated.avatarUrl ?? "")
      setEditOpen(false)
      toast.success("Profile updated")
    } catch (e) {
      toast.error((e as Error).message ?? "Failed to update profile")
    } finally {
      setEditLoading(false)
    }
  }

  if (!isAuthenticated) return null
  if (loading) return <div className="container py-12 text-center text-muted-foreground">Loading profile...</div>
  if (!user) return <div className="container py-12 text-center">Failed to load profile.</div>

  const truncate = (s: string) => `${s.slice(0, 6)}...${s.slice(-4)}`
  const displayName = user.name || user.username || user.email || user.mobile || user.walletAddress || "—"
  const handleOrEmail = user.username ? `@${user.username}` : user.email ?? user.mobile ?? (user.walletAddress ? truncate(user.walletAddress) : "—")

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
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div className="flex flex-row items-start gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.avatarUrl || undefined} />
                <AvatarFallback>{(user.name || user.username || user.email || user.mobile || user.walletAddress || "?").slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">{displayName}</h1>
                  {user.isVerified && <BadgeCheck className="h-5 w-5 text-primary" />}
                </div>
                <p className="text-muted-foreground">{handleOrEmail}</p>
                {user.bio && <p className="mt-2 text-sm">{user.bio}</p>}
                {user.createdAt && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Joined {format(new Date(user.createdAt), "MMM d, yyyy")}
                  </p>
                )}
              </div>
            </div>
            <Dialog
              open={editOpen}
              onOpenChange={(open) => {
                setEditOpen(open)
                if (!open) resetAvatarPicker()
              }}
            >
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Profile photo</Label>
                    <div className="flex flex-wrap items-center gap-3">
                      <Avatar className="h-16 w-16">
                        <AvatarImage
                          src={
                            (avatarPreviewUrl ?? (editAvatarUrl || user.avatarUrl)) || undefined
                          }
                        />
                        <AvatarFallback>
                          {(editName || editUsername || user.email || user.mobile || "?")
                            .slice(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        id="edit-avatar-file"
                        onChange={onAvatarFileChange}
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => avatarInputRef.current?.click()}
                      >
                        Upload image
                      </Button>
                      {avatarFile && (
                        <Button type="button" variant="ghost" size="sm" onClick={resetAvatarPicker}>
                          Clear
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Stored in Cloudinary under{" "}
                      <span className="font-mono text-[11px]">civic-social/profiles/avatars</span>.
                      JPEG, PNG, WebP, or GIF, up to 5&nbsp;MB.
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-name">Name</Label>
                    <Input
                      id="edit-name"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Your name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-username">Username</Label>
                    <Input
                      id="edit-username"
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value.replace(/^@+/, ""))}
                      placeholder="your_handle"
                      autoComplete="username"
                    />
                    <p className="text-xs text-muted-foreground">
                      Assigned at sign-up; you can change it anytime. Use 3–50 characters: letters,
                      numbers, and underscores only.
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-bio">Bio</Label>
                    <Textarea
                      id="edit-bio"
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      placeholder="Tell us about yourself"
                      rows={3}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-avatar">Image URL (optional)</Label>
                    <Input
                      id="edit-avatar"
                      value={editAvatarUrl}
                      onChange={(e) => setEditAvatarUrl(e.target.value)}
                      placeholder="https://..."
                      disabled={Boolean(avatarFile)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Use a link instead of upload, or clear the field to remove your photo.
                    </p>
                  </div>
                  <Button onClick={handleEditSubmit} disabled={editLoading}>
                    {editLoading ? "Saving..." : "Save"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="border-t pt-6 space-y-4">
            {user.email && (
              <div>
                <span className="text-xs font-medium text-muted-foreground">Email</span>
                <p className="text-sm">{user.email}</p>
              </div>
            )}
            {user.mobile && (
              <div>
                <span className="text-xs font-medium text-muted-foreground">Mobile</span>
                <p className="text-sm">{user.mobile}</p>
              </div>
            )}
            {user.updatedAt && (
              <p className="text-xs text-muted-foreground">
                Last updated {format(new Date(user.updatedAt), "MMM d, yyyy")}
              </p>
            )}
          </CardContent>
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
