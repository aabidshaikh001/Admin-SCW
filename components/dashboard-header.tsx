"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, User, Settings, LogOut } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"

export function DashboardHeader() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)

  const getRoleLabel = (type: string | undefined) => {
    switch (type) {
      case "SA":
        return "Super Admin"
      case "Admin":
        return "Web Admin"
      case "User":
        return "User"
      default:
        return "Unknown"
    }
  }

  // Handle Bell click
  const handleBellClick = () => {
    if (user?.UserType === "Admin") {
      router.push("/admin-update")
    } else if (user?.UserType === "User") {
      router.push("/notifications")
    }
  }

  return (
    <motion.header
      initial={{ y: -60 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex items-center justify-between h-16 px-4 border-b border-border bg-gray-800"
    >
      {/* Left section */}
      <div className="flex items-center">
        <span className="px-3 py-1 text-lg font-medium rounded-full 
          text-white bg-primary/20 
          shadow-[0_0_10px_rgba(59,130,246,0.7)] animate-pulse">
          {getRoleLabel(user?.UserType)}
        </span>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4 ml-auto text-white">
        {user?.UserType !== "SA" && (
          <>
            {/* Notifications Bell */}
            <Button
              variant="ghost"
              size="sm"
              className="relative text-white"
              onClick={handleBellClick}
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full"></span>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  aria-label="Open user menu"
                  className="relative h-10 w-10 rounded-full p-0 text-white z-50"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={user?.UserPhoto || "/placeholder.svg"}
                      alt={user?.UserName}
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user?.UserName ? getInitials(user.UserName) : "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-56 z-20" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.UserName}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.UserEmail}</p>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                {user?.UserType === "Admin" && (
                  <>
                    <Link href="/admin-profile">
                      <DropdownMenuItem>
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/settings">
                      <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </DropdownMenuItem>
                    </Link>
                  </>
                )}

                {user?.UserType === "User" && (
                  <>
                    <Link href="/profile">
                      <DropdownMenuItem>
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/user-settings">
                      <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </DropdownMenuItem>
                    </Link>
                  </>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>
    </motion.header>
  )
}
