"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { DashboardLayout } from "@/components/dashboard-layout"
import Link from "next/link"

interface Subscriber {
  Id: number
  OrgCode: number
  Email: string
  IsActive: boolean
  CreatedAt: string
  UpdatedAt: string
}

export default function EditSubscriberPage({ params }: { params: { id: string } }) {
      console.log("Editing subscriber:", params.id) // should log correct ID
  const [subscriber, setSubscriber] = useState<Subscriber | null>(null)
  const [formData, setFormData] = useState({
    Email: "",
    IsActive: true,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchSubscriber()
  }, [params.id])

  const fetchSubscriber = async () => {
    try {
      setLoading(true)
      // Implement get single subscriber API call
      const response = await fetch(`http://localhost:5000/api/newsletter/subscriber/${params.id}`)
      const data = await response.json()

      if (response.ok) {
        setSubscriber(data)
        setFormData({
          Email: data.Email,
          IsActive: data.IsActive,
        })
      } else {
        throw new Error("Subscriber not found")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch subscriber",
        variant: "destructive",
      })
      router.push("/admin-nl/subscribers")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.Email) {
      toast({
        title: "Error",
        description: "Email is required",
        variant: "destructive",
      })
      return
    }

    try {
      setSaving(true)

      const response = await fetch(`http://localhost:5000/api/newsletter/subscriber/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Subscriber updated successfully",
        })
        router.push("/admin-nl/subscribers")
      } else {
        throw new Error(data.error || "Failed to update subscriber")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update subscriber",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/3"></div>
          </div>
          <Card>
            <CardHeader>
              <div className="h-6 bg-muted rounded w-1/3"></div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-10 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-6 bg-muted rounded w-1/6"></div>
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
            <h1 className="text-2xl font-bold text-foreground">Newsletter Subscribers (Update)</h1>
           
          </div>
        </motion.div>

        {/* Form */}
        <Card>
         
        <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.Email}
                  onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
                  placeholder="subscriber@example.com"
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.IsActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, IsActive: checked })}
                />
                <Label htmlFor="isActive">Active Subscriber</Label>
              </div>

              {subscriber && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Created</Label>
                    <p className="text-sm">{new Date(subscriber.CreatedAt).toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Last Updated</Label>
                    <p className="text-sm">{new Date(subscriber.UpdatedAt).toLocaleString()}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Link href="/admin-nl/subscribers">
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Save className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Update Subscriber
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
