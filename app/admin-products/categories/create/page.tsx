"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Upload, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useAuth } from "@/contexts/auth-context" // Make sure this path is correct

export default function CreateCategoryPage() {
    const { user } = useAuth()
    const orgCode = user?.OrgCode || 1000
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    orgCode: orgCode,
    catName: "",
    description: "",
    status: true,
    image: null as File | null,
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }))
      const reader = new FileReader()
      reader.onload = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image: null }))
    setImagePreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.orgCode || !formData.catName) {
      toast({
        title: "Error",
        description: "Organization Code and Category Name are required",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // Build FormData for file upload
      const data = new FormData()
      data.append("OrgCode", formData.orgCode)
      data.append("CatName", formData.catName)
      data.append("Description", formData.description)
      data.append("Status", formData.status ? "1" : "0")
     if (formData.image) {
  data.append("image", formData.image) // lowercase
}

      // Replace with your backend API
      const res = await fetch("https://api.smartcorpweb.com/api/products/categories", {
        method: "POST",
        body: data,
      })

      if (!res.ok) {
        throw new Error("Failed to create category")
      }

      toast({
        title: "Success",
        description: "Category created successfully",
      })
      router.push("/admin-products/categories")
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to create category",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
       
        <div>
          <h1 className="text-2xl font-bold text-foreground">Create Category</h1>
          <p className="text-muted-foreground mt-2">Add a new product category</p>
        </div>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Category Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Org Code & Category Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="space-y-2">
                  <Label htmlFor="catName">Category Name *</Label>
                  <Input
                    id="catName"
                    placeholder="Enter category name"
                    value={formData.catName}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, catName: e.target.value }))
                    }
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter category description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  rows={3}
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-4">
                <Label>Category Image</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={removeImage}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG, GIF up to 10MB
                      </p>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="mt-2"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Status Switch */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="status"
                  checked={formData.status}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, status: checked }))
                  }
                />
                <Label htmlFor="status">Active Status</Label>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Category"}
                </Button>
                <Link href="/admin-products/categories">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
    </DashboardLayout>
  )
}
