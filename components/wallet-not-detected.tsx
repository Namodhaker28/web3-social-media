"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

export function WalletNotDetected() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle>Wallet Not Detected</CardTitle>
          </div>
          <CardDescription>You need a Web3 wallet to use this application</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            We couldn't detect MetaMask or any other Ethereum-compatible wallet in your browser. To use DecentSocial,
            you'll need to install a wallet extension.
          </p>
          <p>We recommend MetaMask, which is available for most modern browsers.</p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => window.open("https://metamask.io/download/", "_blank")} className="w-full">
            Install MetaMask
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

