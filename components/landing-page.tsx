"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ConnectButton } from "@/components/connect-button"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ModeToggle } from "@/components/mode-toggle"
import { ArrowRight, Globe, Lock, Users } from "lucide-react"

export function LandingPage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  // Redirect to feed if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/feed")
    }
  }, [isAuthenticated, router])

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Globe className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">civicGram</h1>
        </div>
        <div className="flex items-center gap-4">
          <ModeToggle />
          <ConnectButton />
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 md:py-24">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          <div className="flex-1 animate-fade-in">
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Social Media <span className="text-primary">Reimagined</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join the community. Own your content, control your data, and engage with people who value privacy and freedom.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild className="px-8">
                <Link href="/register">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">Learn More</Link>
              </Button>
            </div>
          </div>

          <div className="flex-1 animate-fade-in-delayed">
            <div className="bg-card rounded-xl shadow-xl overflow-hidden border border-border">
              <div className="p-6 bg-primary/5 border-b border-border">
                <h3 className="text-2xl font-semibold">Why civicGram?</h3>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Lock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">Own Your Data</h4>
                    <p className="text-muted-foreground">
                      Your content remains yours. We prioritize your privacy and control.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">Community First</h4>
                    <p className="text-muted-foreground">
                      Connect with like-minded individuals in a supportive community.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Globe className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">Open & Transparent</h4>
                    <p className="text-muted-foreground">
                      Built with transparency in mind. Your voice matters.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="container mx-auto px-4 py-8 border-t border-border mt-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground">© 2023 civicGram. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Terms
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Docs
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
