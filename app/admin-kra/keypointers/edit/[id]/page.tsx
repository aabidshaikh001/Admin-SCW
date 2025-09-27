"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"

interface KeyPointer {
  Id: number
  OrgCode: number
  SectionName: string
  Text: string
  TextColor: string
  Counter: number
  CounterColor: string
  Image: string | null
  IsActive: boolean
  CreatedAt: string
  UpdatedAt: string
}

export default function EditKeyPointerPage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [formData, setFormData] = useState({
    SectionName: "", // ✅ Added
    Text: "",
    TextColor: "#000000",
    Counter: 0,
    CounterColor: "#000000",
    Image: "",
    IsActive: true,
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")

  useEffect(() => {
    fetchKeyPointer()
  }, [params.id, user?.OrgCode])

  const fetchKeyPointer = async () => {
    try {
      const orgCode = user?.OrgCode
      if (!orgCode) return
      const response = await fetch(
        `https://api.smartcorpweb.com/api/keypointer/${params.id}?OrgCode=${orgCode}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      )
      if (response.ok) {
        const data: KeyPointer = await response.json()
        setFormData({
          SectionName: data.SectionName,
          Text: data.Text,

          TextColor: data.TextColor,
          Counter: data.Counter,
          CounterColor: data.CounterColor,
          Image: data.Image || "",
          IsActive: data.IsActive,
        })
        setPreviewUrl(data.Image ? `https://api.smartcorpweb.com${data.Image}` : "")
      }
    } catch (error) {
      console.error("Error fetching key pointer:", error)
    } finally {
      setInitialLoading(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setImageFile(file)
    if (file) {
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const orgCode = user?.OrgCode
      if (!orgCode) return

      const fd = new FormData()
      fd.append("Text", formData.Text)
      fd.append("TextColor", formData.TextColor)
      fd.append("Counter", formData.Counter.toString())
      fd.append("CounterColor", formData.CounterColor)
      fd.append("IsActive", formData.IsActive.toString())
      fd.append("OrgCode", orgCode.toString())
      if (imageFile) fd.append("Img", imageFile)

      const response = await fetch(
        `https://api.smartcorpweb.com/api/keypointer/${params.id}?OrgCode=${orgCode}`,
        {
          method: "PUT",
          body: fd,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )

      if (response.ok) {
        toast({ title: "Success", description: "Key pointer updated successfully" })
        router.push("/admin-kra/keypointers")
      } else {
        const err = await response.json()
        throw new Error(err.message || "Failed to update key pointer")
      }
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="h-4 bg-gray-200 rounded w-64 mt-2"></div>
        </div>
      </DashboardLayout>
    )
  }

 return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          
          <div>
            <h1 className="text-2xl font-bold">Key Pointers(Update)</h1>
          
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Key Pointer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* ✅ Section Name */}
               {/* Section Name */}
<div className="space-y-2">
  <Label htmlFor="sectionName">Section Name *</Label>
  <Input
    id="sectionName"
    value={formData.SectionName}
    onChange={(e) => handleChange("SectionName", e.target.value)}
    placeholder="Enter section name"
    required
    maxLength={50}
  />
</div>

                {/* Text */}
                <div className="space-y-2">
                  <Label htmlFor="text">Text *</Label>
                  <Input
                    id="text"
                    value={formData.Text}
                    onChange={(e) => handleChange("Text", e.target.value)}
                    placeholder="Enter key pointer text"
                    required
                    maxLength={50}
                  />
                </div>

                {/* Text Color */}
                <div className="space-y-2">
                  <Label htmlFor="textColor">Text Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="textColor"
                      type="color"
                      value={formData.TextColor}
                      onChange={(e) => handleChange("TextColor", e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={formData.TextColor}
                      onChange={(e) => handleChange("TextColor", e.target.value)}
                      placeholder="#000000"
                      className="flex-1"
                    />
                  </div>
                </div>

                {/* Counter */}
                <div className="space-y-2">
                  <Label htmlFor="counter">Counter *</Label>
                  <Input
                    id="counter"
                    type="number"
                    value={formData.Counter}
                    onChange={(e) => handleChange("Counter", Number(e.target.value) || 0)}
                    placeholder="Enter counter value"
                    required
                    min="0"
                  />
                </div>

                {/* Counter Color */}
                <div className="space-y-2">
                  <Label htmlFor="counterColor">Counter Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="counterColor"
                      type="color"
                      value={formData.CounterColor}
                      onChange={(e) => handleChange("CounterColor", e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={formData.CounterColor}
                      onChange={(e) => handleChange("CounterColor", e.target.value)}
                      placeholder="#000000"
                      className="flex-1"
                    />
                  </div>
                </div>

                {/* Image Upload */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="image">Upload Image</Label>
                  <Input id="image" type="file" accept="image/*" onChange={handleFileChange} />
                  {previewUrl && (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-16 h-16 rounded object-cover mt-2"
                    />
                  )}
                </div>

                {/* Active */}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.IsActive}
                    onCheckedChange={(checked) => handleChange("IsActive", checked)}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "Saving..." : "Save"}
                </Button>
                <Link href="/admin-kra/keypointers">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  )
}
