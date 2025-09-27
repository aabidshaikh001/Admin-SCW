"use client"

import type React from "react"
import { useState, useEffect, type ChangeEvent } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Eye } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"
import { DashboardLayout } from "@/components/dashboard-layout"

interface HeaderType {
  id: number
  OrgCode: number
  name: string
  img?: string
  URL?: string
  alignText?: string
  textColor?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function EditHeaderPage({ params }: { params: { id: string } }) {
  const router = useRouter()
 const { user } = useAuth()
  // For demo purposes, using OrgCode = 1. In real app, this would come from auth context
   const orgCode = user?.OrgCode

  const [formData, setFormData] = useState({
    name: "",
    URL: "",
    alignText: "left",
    textColor: "#000000",
    img: "",
    isActive: true,
  })
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>("")

  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchHeader()
    }
  }, [params.id])

  const fetchHeader = async () => {
    try {
      const response = await fetch(`https://api.smartcorpweb.com/api/header/${params.id}?OrgCode=${orgCode}`)
      if (response.ok) {
        const header: HeaderType = await response.json()
        setFormData({
          name: header.name,
          URL: header.URL || "",
          alignText: header.alignText || "left",
          textColor: header.textColor || "#000000",
          img: header.img || "",
          isActive: header.isActive,
        })
        // FIX: prepend server URL for preview
        if (header.img) {
          setPreview(`https://api.smartcorpweb.com${header.img}`)
        }
      } else {
        throw new Error("Failed to fetch header")
      }
    } catch (error) {
      console.error("Error fetching header:", error)
      toast({
        title: "Error",
        description: "Failed to fetch header details",
        variant: "destructive",
      })
      router.push("/admin-cms/topheader")
    } finally {
      setInitialLoading(false)
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null
    setFile(selectedFile)
    if (selectedFile) {
      setPreview(URL.createObjectURL(selectedFile))
    } else if (formData.img) {
      // keep showing old image if no new file selected
      setPreview(`https://api.smartcorpweb.com${formData.img}`)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)
      const form = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        form.append(key, value as string)
      })
      if (file) {
        form.append("img", file)
      }

      const response = await fetch(`https://api.smartcorpweb.com/api/header/${params.id}?OrgCode=${orgCode}`, {
        method: "PUT",
        body: form,
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Header updated successfully",
        })
        router.push("/admin-cms/topheader")
      } else {
        throw new Error("Failed to update header")
      }
    } catch (error) {
      console.error("Error updating header:", error)
      toast({
        title: "Error",
        description: "Failed to update header",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
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
          <h1 className="text-2xl font-bold text-foreground">Header Management(Update)</h1>
       
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
                {preview && (
                  <img
                    src={preview || "/placeholder.svg"}
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
                  {loading ? "Updating..." : "Update Header"}
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
              {preview && (
                <img
                  src={preview || "/placeholder.svg"}
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
