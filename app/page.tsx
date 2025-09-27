"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export default function HomePage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      // redirect based on role
      if (user.UserType === "SA") {
        router.push("/sa-dashboard")
      } else if (user.UserType === "Admin") {
        router.push("/dashboard")
      } else if (user.UserType === "User") {
        router.push("/user-dashboard")
      } else {
        router.push("/user-dashboard")
      }
    } else {
      // not logged in → go to login
      router.push("/login")
    }
  }, [user, router])

  // nothing to render, just redirect
  return null
}
