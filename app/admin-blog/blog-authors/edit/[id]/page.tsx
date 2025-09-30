"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Save, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { DashboardLayout } from "@/components/dashboard-layout"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"

interface TeamMember {
  Id: number
  OrgCode: number
  Name: string
  Role: string
  Bio: string
  Img: string
  TransDate: string
  IsDeleted: boolean
  IsActive: boolean
  Linkedin?: string
  Twitter?: string
  Facebook?: string
}

export default function EditAuthorPage() {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    Name: "",
    Role: "",
    Bio: "",
    Img: "",
    Linkedin: "",
    Twitter: "",
    Facebook: "",
    IsActive: true,
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const isNew = id === "new"

  useEffect(() => {
    if (!isNew) {
      fetchMember()
    }
  }, [id, isNew])

  const fetchMember = async () => {
    try {
      setLoading(true)
      const response = await fetch(`https://api.smartcorpweb.com/api/blog/authors/${id}`)
      const result = await response.json()

      if (result.success && result.data) {
        const member = result.data
        setFormData({
          Name: member.Name,
          Role: member.Role,
          Bio: member.Bio,
          Img: member.Img,
          Linkedin: member.Linkedin || "",
          Twitter: member.Twitter || "",
          Facebook: member.Facebook || "",
          IsActive: member.IsActive,
        })
      }
    } catch (error) {
      console.error("Error fetching author:", error)
      toast({
        title: "Error",
        description: "Failed to fetch author details",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)

      const memberData = {
        ...formData,
        OrgCode: user?.OrgCode || 1,
        IsDeleted: false,
      }

      const url = isNew ? "https://api.smartcorpweb.com/api/blog/authors" : `https://api.smartcorpweb.com/api/blog/authors/${id}`

      const method = isNew ? "POST" : "PUT"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(memberData),
      })

      if (!response.ok) throw new Error(`Failed to ${isNew ? "create" : "update"} author`)

      toast({
        title: "Success",
        description: `Author ${isNew ? "created" : "updated"} successfully`,
      })

      router.push("/admin-blog/blog-authors")
    } catch (error) {
      console.error("Error saving author:", error)
      toast({
        title: "Error",
        description: `Failed to ${isNew ? "create" : "update"} author`,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const uploadData = new FormData();   // ✅ renamed
  uploadData.append("image", file);

  try {
    const response = await fetch("https://api.smartcorpweb.com/api/blog/authors/upload", {
      method: "POST",
      body: uploadData,   // ✅ use renamed
    });

    const result = await response.json();

    if (result.success) {
      setFormData(prev => ({ ...prev, Img: result.filePath }));  // ✅ no conflict

      toast({
        title: "Image uploaded",
        description: "Profile image uploaded successfully",
      });
    } else {
      throw new Error(result.message || "Upload failed");
    }
  } catch (error) {
    console.error("Upload error:", error);
    toast({
      title: "Error",
      description: "Failed to upload image",
      variant: "destructive",
    });
  }
};


  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
         
          <div>
            <h1 className="text-2xl font-bold text-foreground">{isNew ? "Author(Add)" : "Author(Update))"}</h1>
          
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>{isNew ? "New Author" : "Edit Author"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.Name}
                    onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role *</Label>
                  <Input
                    id="role"
                    value={formData.Role}
                    onChange={(e) => setFormData({ ...formData, Role: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.Bio}
                  onChange={(e) => setFormData({ ...formData, Bio: e.target.value })}
                  rows={4}
                  placeholder="Brief description of the author..."
                />
              </div>

           <div>
  <Label htmlFor="imageUpload">Profile Image</Label>
  <div className="flex gap-2 items-center">
    <Button
      type="button"
      variant="outline"
      onClick={() => document.getElementById("imageUpload")?.click()}
    >
      <ImageIcon className="w-4 h-4 mr-2" />
      {formData.Img ? "Change Image" : "Upload Image"}
    </Button>
    <input
      id="imageUpload"
      type="file"
      accept="image/*"
      onChange={handleImageUpload}
      className="hidden"
    />
  </div>

  {/* ✅ Preview */}
  {formData.Img && (
    <img
      src={`https://api.smartcorpweb.com${formData.Img}`}
      alt="Preview"
      className="mt-2 w-24 h-24 rounded object-cover border"
    />
  )}
</div>

              <div>
                <Label>Social Media Links</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                  <div>
                    <Label htmlFor="linkedin" className="text-sm">
                      LinkedIn
                    </Label>
                    <Input
                      id="linkedin"
                      value={formData.Linkedin}
                      onChange={(e) => setFormData({ ...formData, Linkedin: e.target.value })}
                      placeholder="LinkedIn URL"
                    />
                  </div>
                  <div>
                    <Label htmlFor="twitter" className="text-sm">
                      Twitter
                    </Label>
                    <Input
                      id="twitter"
                      value={formData.Twitter}
                      onChange={(e) => setFormData({ ...formData, Twitter: e.target.value })}
                      placeholder="Twitter URL"
                    />
                  </div>
                  <div>
                    <Label htmlFor="facebook" className="text-sm">
                      Facebook
                    </Label>
                    <Input
                      id="facebook"
                      value={formData.Facebook}
                      onChange={(e) => setFormData({ ...formData, Facebook: e.target.value })}
                      placeholder="Facebook URL"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.IsActive}
                  onChange={(e) => setFormData({ ...formData, IsActive: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="isActive">Active</Label>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Save className="w-4 h-4 mr-2 animate-spin" />
                      {isNew ? "Creating..." : "Updating..."}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {isNew ? "Create Author" : "Update Author"}
                    </>
                  )}
                </Button>
                <Link href="/admin-blog/blog-authors">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
