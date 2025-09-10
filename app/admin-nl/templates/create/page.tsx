"use client"

import type React from "react"

import { useState } from "react"
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

import { useAuth } from "@/contexts/auth-context"
import dynamic from "next/dynamic"
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false })
import "react-quill/dist/quill.snow.css"

export default function CreateTemplatePage() {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    Name: "",
    Subject: "",
    Body: "",
    IsActive: true,
  })
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

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
    const orgCode = `${user?.OrgCode}` // Replace with actual org code from auth/context

      const response = await fetch("http://localhost:5000/api/newsletter/template", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          OrgCode: orgCode,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Emailer created successfully",
        })
        router.push("/admin-nl/templates")
      } else {
        throw new Error(data.error || "Failed to create emailer")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create emailer",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
       
          <div>
            <h1 className="text-3xl font-bold text-foreground">Emailer (Add)</h1>
            {/* <p className="text-muted-foreground">Design a new newsletter template</p> */}
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
                <Label htmlFor="isActive">Active Template</Label>
              </div>

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
