"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Eye } from "lucide-react"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function CreateHeaderPage() {
  const router = useRouter()
 const { user } = useAuth()
  // For demo purposes, using OrgCode = 1. In real app, this would come from auth context
  const orgCode = user?.OrgCode

  const [formData, setFormData] = useState({
    name: "",
    URL: "",
    alignText: "left",
    textColor: "#000000",
    isActive: true,
  })

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [loading, setLoading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setPreviewUrl(URL.createObjectURL(file)) // instant preview
    } else {
      setImageFile(null)
      setPreviewUrl("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)
      const fd = new FormData()
      fd.append("OrgCode", orgCode.toString())
      Object.entries(formData).forEach(([key, value]) => {
        fd.append(key, value.toString())
      })
      if (imageFile) fd.append("img", imageFile)

      const response = await fetch("https://api.smartcorpweb.com/api/header", {
        method: "POST",
        body: fd,
      })

      if (response.ok) {
        const data = await response.json()
        const imagePath = data.img || data.path

        if (imagePath) {
          setPreviewUrl(`https://api.smartcorpweb.com${imagePath}`) // backend preview
        }

        toast({
          title: "Success",
          description: "Header created successfully",
        })

        // optional: wait 1s before navigating so user sees uploaded preview
        setTimeout(() => {
          router.push("/admin-cms/topheader")
        }, 1000)
      } else {
        throw new Error("Failed to create header")
      }
    } catch (error) {
      console.error("Error creating header:", error)
      toast({
        title: "Error",
        description: "Failed to create header",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Link href="/admin-cms/topheader">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Headers
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Add Header</h1>
          <p className="text-muted-foreground">Create a new top section header with styling</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Header Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* name */}
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter header name"
                  required
                />
              </div>

              {/* URL */}
              <div>
                <Label htmlFor="URL">URL</Label>
                <Input
                  id="URL"
                  value={formData.URL}
                  onChange={(e) => setFormData({ ...formData, URL: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>

              {/* text alignment */}
              <div>
                <Label htmlFor="alignText">Text Alignment</Label>
                <Select
                  value={formData.alignText}
                  onValueChange={(value) => setFormData({ ...formData, alignText: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select alignment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* text color */}
              <div>
                <Label htmlFor="textColor">Text Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="textColor"
                    type="color"
                    value={formData.textColor}
                    onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={formData.textColor}
                    onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                    placeholder="#000000"
                  />
                </div>
              </div>

              {/* image upload */}
              <div>
                <Label htmlFor="image">Upload Image</Label>
                <Input id="image" type="file" accept="image/*" onChange={handleFileChange} />
                {previewUrl && (
                  <img
                    src={previewUrl || "/placeholder.svg"}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded mt-2"
                  />
                )}
              </div>

              {/* active toggle */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? "Creating..." : "Create Header"}
                </Button>
                <Link href="/admin-cms/topheader">
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Live Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-6 bg-background">
              {previewUrl && (
                <img
                  src={previewUrl || "/placeholder.svg"}
                  alt="Header"
                  className="w-full h-32 object-cover rounded mb-4"
                />
              )}
              <div
                className={`text-xl font-bold mb-2 text-${formData.alignText}`}
                style={{
                  color: formData.textColor,
                  textAlign: formData.alignText as "left" | "center" | "right",
                }}
              >
                {formData.name || "Header Name"}
              </div>
              {formData.URL && (
                <a
                  href={formData.URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-sm text-blue-600 hover:underline block text-${formData.alignText}`}
                  style={{ textAlign: formData.alignText as "left" | "center" | "right" }}
                >
                  {formData.URL}
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </DashboardLayout>
  )
}
