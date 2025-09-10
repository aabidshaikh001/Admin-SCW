"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { DashboardLayout } from "@/components/dashboard-layout"
import Link from "next/link"
import dynamic from "next/dynamic"
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false })
import "react-quill/dist/quill.snow.css"

interface Template {
  Id: number
  OrgCode: number
  Name: string
  Subject: string
  Body: string
  IsActive: boolean
  CreatedAt: string
  UpdatedAt: string
}

export default function EditTemplatePage({ params }: { params: { id: string } }) {
  const [template, setTemplate] = useState<Template | null>(null)
  const [formData, setFormData] = useState({
    Name: "",
    Subject: "",
    Body: "",
    IsActive: true,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchTemplate()
  }, [params.id])

  const fetchTemplate = async () => {
    try {
      setLoading(true)
      // Implement get single template API call
      const response = await fetch(`http://localhost:5000/api/newsletter/template/${params.id}`)
      const data = await response.json()

      if (response.ok) {
        setTemplate(data)
        setFormData({
          Name: data.Name,
          Subject: data.Subject,
          Body: data.Body,
          IsActive: data.IsActive,
        })
      } else {
        throw new Error("Template not found")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch Emailer",
        variant: "destructive",
      })
      router.push("/admin-nl/templates")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.Name || !formData.Subject || !formData.Body) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive",
      })
      return
    }

    try {
      setSaving(true)

      const response = await fetch(`http://localhost:5000/api/newsletter/template/${params.id}`, {
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
          description: "Emailer updated successfully",
        })
        router.push("/admin-nl/templates")
      } else {
        throw new Error(data.error || "Failed to update Emailer")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update Emailer",
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                  <div className="h-10 bg-muted rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                  <div className="h-10 bg-muted rounded"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="h-40 bg-muted rounded"></div>
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
            <h1 className="text-3xl font-bold text-foreground">Emailer (Update)</h1>
         
          </div>
        </motion.div>

        {/* Form */}
        <Card>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Emailer Name *</Label>
                  <Input
                    id="name"
                    value={formData.Name}
                    onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
                    placeholder="Emailer Name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Email Subject *</Label>
                  <Input
                    id="subject"
                    value={formData.Subject}
                    onChange={(e) => setFormData({ ...formData, Subject: e.target.value })}
                    placeholder="Email Subject"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
  <Label htmlFor="body">Email Body *</Label>
  <Tabs defaultValue="edit" className="w-full">
    <TabsList>
      <TabsTrigger value="edit">Edit</TabsTrigger>
      <TabsTrigger value="preview">Preview</TabsTrigger>
    </TabsList>

    {/* HTML Editor */}
    <TabsContent value="edit">
      <ReactQuill
  theme="snow"
  value={formData.Body}
  onChange={(value) => setFormData({ ...formData, Body: value })}
  className="bg-white rounded-md"
  style={{ minHeight: "300px" }} // container min height
/>


    </TabsContent>

    {/* Preview */}
    <TabsContent value="preview">
      <div
        className="border rounded-md p-4 min-h-[300px] bg-white"
        dangerouslySetInnerHTML={{ __html: formData.Body || "<p>No content to preview</p>" }}
      />
    </TabsContent>
  </Tabs>
</div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.IsActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, IsActive: checked })}
                />
                <Label htmlFor="isActive">Active Emailer</Label>
              </div>

              {template && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Created</Label>
                    <p className="text-sm">{new Date(template.CreatedAt).toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Last Updated</Label>
                    <p className="text-sm">{new Date(template.UpdatedAt).toLocaleString()}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Link href="/admin-nl/templates">
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Save className="w-4 h-4 mr-2 animate-spin" />
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
      </div>
    </DashboardLayout>
  )
}
