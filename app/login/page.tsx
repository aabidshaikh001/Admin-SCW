"use client"

import { motion } from "framer-motion"
import { LoginForm } from "@/components/login-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function LoginPage() {
  const { user } = useAuth()
  const router = useRouter()

 
  useEffect(() => {
    if (user) {
      // check UserType
      if (user.UserType === "SA") {
        router.push("/sa-dashboard")
      } else if (user.UserType === "Admin") {
        router.push("/dashboard")
      } else {
        router.push("/user-dashboard")
      }
    }
  }, [user, router])
  if (user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold text-primary mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Professional Business Management</p>
        </motion.div>

        <LoginForm />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className="text-center"
        >
         
        </motion.div>
      </div>
    </div>
  )
}
