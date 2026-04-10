"use client"

import { useAuth } from "./auth-provider"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, User } from "lucide-react"
import Link from "next/link"

/** Account dropdown for authenticated users; Log in / Sign up links when unauthenticated. */
export function ConnectButton({ showBalance = false }: { showBalance?: boolean }) {
  const { isAuthenticated, logout } = useAuth()

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/login">
          <Button variant="ghost">Log in</Button>
        </Link>
        <Link href="/register">
          <Button variant="outline">Sign up</Button>
        </Link>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <User className="mr-2 h-4 w-4" />
          Account
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            logout()
            window.location.href = "/"
          }}
          className="cursor-pointer text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
