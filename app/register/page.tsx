"use client"

import { motion } from "framer-motion"
import { RegisterForm } from "@/components/register-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function RegisterPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push("/dashboard")
    }
  }, [user, router])

  if (user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-2xl font-bold text-primary mb-2">Join Dashboard</h1>
          <p className="text-muted-foreground">Create your professional account</p>
        </motion.div>

        <RegisterForm />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className="text-center"
        >
          <p className="text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login">
              <Button variant="link" className="p-0 h-auto text-primary hover:text-primary/80">
                Sign in here
              </Button>
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
