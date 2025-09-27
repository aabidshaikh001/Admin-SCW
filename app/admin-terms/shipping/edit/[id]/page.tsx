"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { DashboardLayout } from "@/components/dashboard-layout"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"

interface TOS {
  id: number
  OrgCode: number
  question: string
  answer: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function EditTOSPage({ params }: { params: { id: string } }) {
     const { user } = useAuth()
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    isActive: true,
  })
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchTOS()
  }, [])

  const fetchTOS = async () => {
  try {
    setFetching(true)
    const orgCode = user?.OrgCode || 1
    const response = await fetch(`https://api.smartcorpweb.com/api/shipping/${orgCode}/${params.id}`)

    if (response.ok) {
      const result = await response.json()
      const tosItem = result.data && result.data.length > 0 ? result.data[0] : null

      if (!tosItem) throw new Error("TOS not found")

      setFormData({
        question: tosItem.question,
        answer: tosItem.answer,
        isActive: tosItem.isActive,
      })
    } else {
      throw new Error("TOS not found")
    }
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to fetch Shipping Terms item",
      variant: "destructive",
    })
    router.push("/admin-terms/shipping")
  } finally {
    setFetching(false)
  }
}

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.question.trim() || !formData.answer.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      const orgCode = user?.OrgCode || 1 // Replace with actual org code from auth
      const response = await fetch(`https://api.smartcorpweb.com/api/shipping/${orgCode}/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Shipping Terms item updated successfully",
        })
        router.push("/admin-terms/shipping")
      } else {
        throw new Error("Failed to update Shipping Terms item")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update Shipping Terms item",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  if (fetching) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-9 bg-muted rounded w-20 animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-8 bg-muted rounded w-64 animate-pulse"></div>
              <div className="h-4 bg-muted rounded w-48 animate-pulse"></div>
            </div>
          </div>
          <Card>
            <CardHeader>
              <div className="h-6 bg-muted rounded w-48 animate-pulse"></div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-20 animate-pulse"></div>
                <div className="h-10 bg-muted rounded animate-pulse"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-16 animate-pulse"></div>
                <div className="h-32 bg-muted rounded animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
         
          <div>
            <h1 className="text-2xl font-bold text-foreground">Shipping Terms(Update)</h1>
        
          </div>
        </motion.div>

        {/* Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader>
              <CardTitle>Shipping Terms Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="question">Question *</Label>
                  <Input
                    id="question"
                    value={formData.question}
                    onChange={(e) => handleInputChange("question", e.target.value)}
                    placeholder="Enter the question or topic"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="answer">Answer *</Label>
                  <Textarea
                    id="answer"
                    value={formData.answer}
                    onChange={(e) => handleInputChange("answer", e.target.value)}
                    placeholder="Enter the detailed answer or terms"
                    rows={8}
                    required
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => handleInputChange("isActive", checked)}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Link href="/admin-terms/shipping">
                    <Button variant="outline" type="button">
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </Link>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-background border-t-foreground" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                       Save
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
