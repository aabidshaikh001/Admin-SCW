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

interface Category {
  Id: number
  OrgCode: number
  CategoryName: string
  Img: string
  TransDate: string
  IsDeleted: boolean
  IsActive: boolean
  Description?: string
}

export default function EditCategoryPage() {
  const [formData, setFormData] = useState({
    CategoryName: "",
    Description: "",
    Img: "",
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
      fetchCategory()
    }
  }, [id, isNew])

  const fetchCategory = async () => {
    try {
      setLoading(true)
      const response = await fetch(`https://api.smartcorpweb.com/api/blog/category/${id}`)
      const result = await response.json()

      if (result.success && result.data) {
        const category = result.data
        setFormData({
          CategoryName: category.CategoryName,
          Description: category.Description || "",
          Img: category.Img,
          IsActive: category.IsActive,
        })
      }
    } catch (error) {
      console.error("Error fetching category:", error)
      toast({
        title: "Error",
        description: "Failed to fetch category details",
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

      const categoryData = {
        ...formData,
        OrgCode: 1, // Replace with actual org code from auth
        IsDeleted: false,
      }

      const url = isNew ? "https://api.smartcorpweb.com/api/blog/category" : `https://api.smartcorpweb.com/api/blog/category/${id}`

      const method = isNew ? "POST" : "PUT"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(categoryData),
      })

      if (!response.ok) throw new Error(`Failed to ${isNew ? "create" : "update"} category`)

      toast({
        title: "Success",
        description: `Category ${isNew ? "created" : "updated"} successfully`,
      })

      router.push("/admin-blog/blog-categories")
    } catch (error) {
      console.error("Error saving category:", error)
      toast({
        title: "Error",
        description: `Failed to ${isNew ? "create" : "update"} category`,
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
    const response = await fetch("https://api.smartcorpweb.com/api/blog/categories/upload", {
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
            <h1 className="text-2xl font-bold text-foreground">{isNew ? "Category (New)" : "Category (Update)"}</h1>
           
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>{isNew ? "New Category" : "Edit Category"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="categoryName">Category Name *</Label>
                <Input
                  id="categoryName"
                  value={formData.CategoryName}
                  onChange={(e) => setFormData({ ...formData, CategoryName: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.Description}
                  onChange={(e) => setFormData({ ...formData, Description: e.target.value })}
                  rows={4}
                  placeholder="Brief description of the category..."
                />
              </div>

            <div>
  <Label htmlFor="imageUpload">Category Image</Label>
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

  {/* ✅ Preview Section */}
  {formData.Img && (
    <div className="mt-2 flex items-center gap-2">
      <img
        src={`https://api.smartcorpweb.com${formData.Img}`}
        alt="Category Preview"
        className="w-24 h-24 rounded object-cover border"
      />
      <Button
        type="button"
        variant="destructive"
        size="sm"
        onClick={() => setFormData(prev => ({ ...prev, Img: "" }))}
      >
        Remove
      </Button>
    </div>
  )}
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
                      {isNew ? "Create Category" : "Update Category"}
                    </>
                  )}
                </Button>
                <Link href="/admin-blog/blog-categories">
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
