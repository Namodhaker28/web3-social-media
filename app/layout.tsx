import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AppProviders } from "@/components/app-providers"
import { AdsenseScript } from "@/components/adsense-script"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "civicGram - Social Media",
  description: "A social media platform built for community",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AppProviders>
            <AdsenseScript />
            {children}
            <Toaster />
          </AppProviders>
        </ThemeProvider>
      </body>
    </html>
  )
}