"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  Globe,
  IndianRupee,
  Landmark,
  Megaphone,
  ShieldCheck,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Users,
} from "lucide-react"

import BlurText from "@/components/BlurText"
import CountUp from "@/components/CountUp"
import FadeContent from "@/components/FadeContent"
import { ConnectButton } from "@/components/connect-button"
import { useAuth } from "@/components/auth-provider"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

/** Marketing landing: React Bits animations + civicGram product story (votes, earnings, moderation, civic impact). */
export function LandingPage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/feed")
    }
  }, [isAuthenticated, router])

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/60">
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Globe className="h-6 w-6 text-primary" aria-hidden />
          <span className="text-2xl font-bold tracking-tight">civicGram</span>
        </div>
        <div className="flex items-center gap-4">
          <ModeToggle />
          <ConnectButton />
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="container mx-auto px-4 pt-6 pb-16 md:pt-12 md:pb-24">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <BlurText
              text="Social voice that earns trust and rewards"
              className="justify-center text-4xl md:text-6xl font-bold leading-tight text-foreground"
              delay={90}
              animateBy="words"
              direction="top"
            />
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
              Post ideas that matter. The community upvotes and downvotes. Net support turns into creator payouts—so
              quality civic conversation is worth real money, for you and for the public square.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <Button size="lg" asChild className="px-8">
                <Link href="/register">
                  Get started <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
            </div>
          </div>

          {/* Animated stats */}
          <FadeContent
            className="mt-16 md:mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto"
            blur
            duration={900}
            ease="power2.out"
          >
            <Card className="border-border/80 bg-card/80 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardDescription>Vote signal</CardDescription>
                <CardTitle className="text-3xl font-bold tabular-nums flex flex-wrap items-baseline gap-2">
                  <span className="flex items-center gap-2">
                    <ThumbsUp className="h-6 w-6 text-primary shrink-0" aria-hidden />
                    <ThumbsDown className="h-6 w-6 text-muted-foreground shrink-0" aria-hidden />
                  </span>
                  <span className="flex items-baseline gap-1">
                    <CountUp to={2} duration={1.2} delay={0.1} />
                    <span className="text-lg font-semibold text-muted-foreground">ways to vote</span>
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Net score (upvotes minus downvotes) drives reach, trending, and how much each post earns in a period.
              </CardContent>
            </Card>
            <Card className="border-border/80 bg-card/80 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardDescription>Creator economics</CardDescription>
                <CardTitle className="text-3xl font-bold tabular-nums flex flex-wrap items-baseline gap-2">
                  <IndianRupee className="h-6 w-6 text-primary shrink-0" aria-hidden />
                  <span className="flex items-baseline gap-1">
                    <CountUp to={100} duration={2} delay={0.15} />
                    <span className="text-lg font-semibold text-muted-foreground">+ net pts</span>
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Illustrative scale: breakout civic posts can accumulate large net scores—each point maps to configured
                INR payouts when a month closes.
              </CardContent>
            </Card>
            <Card className="border-border/80 bg-card/80 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardDescription>Safe feed</CardDescription>
                <CardTitle className="text-3xl font-bold tabular-nums flex items-baseline gap-1">
                  <ShieldCheck className="h-6 w-6 text-primary shrink-0" aria-hidden />
                  <CountUp to={3} duration={1.4} delay={0.2} />
                  <span className="text-lg font-semibold text-muted-foreground">steps</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Submit → moderator review → approved posts go live. Voting only counts where the community is protected.
              </CardContent>
            </Card>
          </FadeContent>
        </section>

        {/* Features */}
        <section className="border-y border-border/60 bg-muted/30 py-16 md:py-24">
          <div className="container mx-auto px-4">
            <FadeContent className="max-w-2xl mx-auto text-center mb-12 md:mb-16" blur duration={800}>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Built for votes, cash, and civic impact</h2>
              <p className="mt-3 text-muted-foreground text-lg">
                Everything you do on civicGram ties together: expression, reputation, income, and healthier national
                conversation.
              </p>
            </FadeContent>

            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              <FadeContent blur duration={850} delay={50}>
                <Card className="h-full border-border/80 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-2">
                      <ThumbsUp className="h-6 w-6 text-primary" aria-hidden />
                    </div>
                    <CardTitle>Upvote & downvote</CardTitle>
                    <CardDescription>
                      Agree, disagree, or correct the record—votes are first-class. Your feed and trending surfaces react
                      to real sentiment, not vanity metrics alone.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </FadeContent>

              <FadeContent blur duration={850} delay={80}>
                <Card className="h-full border-border/80 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-2">
                      <ThumbsDown className="h-6 w-6 text-primary" aria-hidden />
                    </div>
                    <CardTitle>Net score that matters</CardTitle>
                    <CardDescription>
                      We use net support (up minus down) so brigading is harder and quality rises. That same net score
                      feeds rankings and creator payouts.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </FadeContent>

              <FadeContent blur duration={850} delay={110}>
                <Card className="h-full border-border/80 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-2">
                      <IndianRupee className="h-6 w-6 text-primary" aria-hidden />
                    </div>
                    <CardTitle>Earn from posts</CardTitle>
                    <CardDescription>
                      Approved posts accrue net votes over each month. When a period closes, earnings lines are computed
                      from net score—turning civic attention into income for serious creators.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </FadeContent>

              <FadeContent blur duration={850} delay={140}>
                <Card className="h-full border-border/80 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-2">
                      <Landmark className="h-6 w-6 text-primary" aria-hidden />
                    </div>
                    <CardTitle>Good for the nation</CardTitle>
                    <CardDescription>
                      Moderation + transparent voting nudge public debate toward substance. When good posts pay,
                      incentives align with informed citizens—not just outrage loops.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </FadeContent>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="container mx-auto px-4 py-16 md:py-24">
          <FadeContent className="max-w-2xl mb-12" blur duration={800}>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">How everything works</h2>
            <p className="mt-3 text-muted-foreground text-lg">
              From first post to payout, the loop is simple and built for accountability.
            </p>
          </FadeContent>

          <ol className="relative max-w-3xl space-y-10 border-l border-primary/30 pl-8 ml-3 md:ml-6">
            {[
              {
                step: 1,
                title: "Create & submit",
                body: "Share text, images, or video. New posts enter moderation so the network stays trustworthy.",
                icon: Megaphone,
              },
              {
                step: 2,
                title: "Community votes",
                body: "Once approved, anyone can upvote or downvote. Net score decides momentum and monthly earnings.",
                icon: Users,
              },
              {
                step: 3,
                title: "Period closes & pays",
                body: "Each calendar window, net votes convert to payouts for authors—rewarding posts that actually helped people decide and discuss.",
                icon: Sparkles,
              },
            ].map(({ step, title, body, icon: Icon }) => (
              <FadeContent key={step} blur duration={750} delay={step * 40}>
                <li className="relative">
                  <span className="absolute -left-[41px] md:-left-[49px] top-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-primary bg-background text-sm font-bold text-primary">
                    {step}
                  </span>
                  <div className="flex items-start gap-3">
                    <Icon className="h-6 w-6 text-primary shrink-0 mt-0.5" aria-hidden />
                    <div>
                      <h3 className="text-xl font-semibold">{title}</h3>
                      <p className="mt-2 text-muted-foreground leading-relaxed">{body}</p>
                    </div>
                  </div>
                </li>
              </FadeContent>
            ))}
          </ol>
        </section>

        {/* Closing CTA */}
        <section className="border-t border-border/60 bg-muted/40 py-16">
          <FadeContent className="container mx-auto px-4 text-center max-w-2xl" blur duration={900}>
            <h2 className="text-2xl md:text-3xl font-bold">Ready to speak up and get paid?</h2>
            <p className="mt-3 text-muted-foreground">
              Join civicGram—where votes count twice: for the culture and for your wallet.
            </p>
            <Button size="lg" asChild className="mt-8 px-8">
              <Link href="/register">
                Create your account <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
            </Button>
          </FadeContent>
        </section>
      </main>

      <footer className="container mx-auto px-4 py-8 border-t border-border mt-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">© 2026 civicGram. All rights reserved.</p>
          <nav className="flex gap-6" aria-label="Footer">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Docs
            </a>
          </nav>
        </div>
      </footer>
    </div>
  )
}
