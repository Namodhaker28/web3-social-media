"use client"

import { useState, useEffect } from "react"
import { useWeb3 } from "@/components/web3-provider"
import { useRouter } from "next/navigation"
import { ConnectButton } from "@/components/connect-button"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WalletNotDetected } from "@/components/wallet-not-detected"
import {
  Bell,
  Bookmark,
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
} from "lucide-react"
import { mockPosts } from "@/lib/mock-data"
import { formatDistanceToNow } from "date-fns"

export function FeedPage() {
  const { account, chainName, isConnected } = useWeb3()
  const router = useRouter()
  const [posts, setPosts] = useState(mockPosts)
  const [newPostContent, setNewPostContent] = useState("")
  const [isCreatingPost, setIsCreatingPost] = useState(false)
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(true)

  // Check if MetaMask is installed
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMetaMaskInstalled(window.ethereum !== undefined)
    }
  }, [])

  // Redirect to home if not connected
  useEffect(() => {
    if (!isConnected && typeof window !== "undefined") {
      router.push("/")
    }
  }, [isConnected, router])

  if (!isMetaMaskInstalled) {
    return <WalletNotDetected />
  }

  if (!isConnected) {
    return null
  }

  const handleCreatePost = () => {
    if (!newPostContent.trim()) return

    const newPost = {
      id: String(Date.now()),
      content: newPostContent,
      author: {
        address: account || "0x0",
        name: "You",
        avatar: "/placeholder.svg?height=100&width=100",
      },
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: 0,
      hasLiked: false,
    }

    setPosts([newPost, ...posts])
    setNewPostContent("")
    setIsCreatingPost(false)
  }

  const handleLike = (postId: string) => {
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            likes: post.hasLiked ? post.likes - 1 : post.likes + 1,
            hasLiked: !post.hasLiked,
          }
        }
        return post
      }),
    )
  }

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Globe className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">DecentSocial</h1>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-10 w-[250px]" />
            </div>
          </div>
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
            <Button variant="ghost" className="w-full justify-start" size="lg">
              <Home className="mr-2 h-5 w-5" />
              Home
            </Button>
            <Button variant="ghost" className="w-full justify-start" size="lg">
              <User className="mr-2 h-5 w-5" />
              Profile
            </Button>
            <Button variant="ghost" className="w-full justify-start" size="lg">
              <Bell className="mr-2 h-5 w-5" />
              Notifications
            </Button>
            <Button variant="ghost" className="w-full justify-start" size="lg">
              <Bookmark className="mr-2 h-5 w-5" />
              Bookmarks
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
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>{account ? account.slice(2, 4).toUpperCase() : "AN"}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">Connected Wallet</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    {account && truncateAddress(account)}
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-100">
                      {chainName || "Unknown Network"}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Dialog open={isCreatingPost} onOpenChange={setIsCreatingPost}>
                <DialogTrigger asChild>
                  <div className="flex items-center gap-3 cursor-pointer">
                    <Avatar>
                      <AvatarFallback>{account ? account.slice(2, 4).toUpperCase() : "AN"}</AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-full py-3 px-4 text-muted-foreground flex-1">
                      What's on your mind?
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[525px]">
                  <DialogHeader>
                    <DialogTitle>Create a new post</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarFallback>{account ? account.slice(2, 4).toUpperCase() : "AN"}</AvatarFallback>
                      </Avatar>
                      <Textarea
                        placeholder="What's on your mind?"
                        className="flex-1 resize-none"
                        rows={5}
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <Button variant="outline" size="sm">
                        <Image className="h-4 w-4 mr-2" />
                        Add Image
                      </Button>
                      <Button onClick={handleCreatePost} disabled={!newPostContent.trim()}>
                        Post
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
            <CardFooter className="border-t pt-3">
              <div className="flex justify-between w-full">
                <Button variant="ghost" onClick={() => setIsCreatingPost(true)}>
                  <PenSquare className="h-5 w-5 mr-2" />
                  Post
                </Button>
                <Button variant="ghost">
                  <Image className="h-5 w-5 mr-2" />
                  Image
                </Button>
              </div>
            </CardFooter>
          </Card>

          <Tabs defaultValue="foryou">
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
              {posts.map((post) => (
                <Card key={post.id}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={post.author.avatar} alt={post.author.name} />
                          <AvatarFallback>{post.author.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold">{post.author.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {post.author.address === account ? "You" : truncateAddress(post.author.address)} ·{" "}
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
                  </CardContent>
                  <CardFooter className="border-t pt-3">
                    <div className="flex justify-between w-full">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLike(post.id)}
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
              ))}
            </TabsContent>

            <TabsContent value="following" className="space-y-6 mt-0">
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
                <p className="text-muted-foreground">Follow some accounts to see their posts here.</p>
              </div>
            </TabsContent>

            <TabsContent value="trending" className="space-y-6 mt-0">
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold mb-2">Trending content coming soon</h3>
                <p className="text-muted-foreground">We're still gathering trending content for you.</p>
              </div>
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
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={`/placeholder.svg?height=40&width=40&text=User${i}`} />
                        <AvatarFallback>U{i}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">Web3 User {i}</div>
                        <div className="text-sm text-muted-foreground">
                          {truncateAddress(`0x${i}23456789abcdef0123456789abcdef0123456`)}
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Follow
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Trending Topics</h3>
              </CardHeader>
              <CardContent className="space-y-2">
                {["#Web3", "#Blockchain", "#NFTs", "#DeFi", "#Crypto"].map((tag) => (
                  <div key={tag} className="text-sm">
                    <a href="#" className="text-primary hover:underline">
                      {tag}
                    </a>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </aside>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border bg-background z-10">
        <div className="flex justify-around py-2">
          <Button variant="ghost" size="icon">
            <Home className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon">
            <Search className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setIsCreatingPost(true)}>
            <PenSquare className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon">
            <Bell className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon">
            <User className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  )
}

