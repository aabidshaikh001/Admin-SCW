"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Upload, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useAuth } from "@/contexts/auth-context" // Make sure this path is correct

interface SubCategory {
  Id: number
  OrgCode: number
  CatId: number
  SubCatName: string
  Description?: string
  Image?: string
  Status: boolean
}

interface Category {
  Id: number
  CatName: string
}

export default function EditSubCategoryPage({ params }: { params: { id: string } }) {
    const { user } = useAuth()
        const orgCode = user?.OrgCode || 1000
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    orgCode: orgCode,
    catId: "",
    subCatName: "",
    description: "",
    status: true,
    image: null as File | null,
  })

  useEffect(() => {
    fetchData()
  }, [params.id])

  // Fetch categories and sub-category details from real API
  const fetchData = async () => {
    try {
      setFetching(true)

      // Fetch categories
 const catRes = await fetch(`https://api.smartcorpweb.com/api/products/categories/${orgCode}`)
if (!catRes.ok) throw new Error("Failed to fetch categories")

const json = await catRes.json()
setCategories(json.data) // <-- fix: use json.data

      // Fetch sub-category details
      const subRes = await fetch(`https://api.smartcorpweb.com/api/products/subcategories/${orgCode}/${params.id}`)
      if (!subRes.ok) throw new Error("Failed to fetch sub-category")
   const subJson = await subRes.json()
const subData: SubCategory = subJson.data[0] // <-- first item from data array

      setFormData({
        orgCode: subData.OrgCode.toString(),
        catId: subData.CatId.toString(),
        subCatName: subData.SubCatName,
        description: subData.Description || "",
        status: subData.Status,
        image: null,
      })

      if (subData.Image) {
        setImagePreview(`https://api.smartcorpweb.com${subData.Image}`)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch sub-category data",
        variant: "destructive",
      })
    } finally {
      setFetching(false)
    }
  }

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

    if (!formData.orgCode || !formData.catId || !formData.subCatName) {
      toast({
        title: "Error",
        description: "Organization Code, Category, and Sub Category Name are required",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const form = new FormData()
         form.append("OrgCode", formData.orgCode.toString())
    form.append("CatId", formData.catId)
    form.append("SubCatName", formData.subCatName)
    form.append("Description", formData.description || "")
    form.append("Status", formData.status ? "1" : "0") // Send as string

      if (formData.image) {
        form.append("image", formData.image)
      }

      const res = await fetch(`https://api.smartcorpweb.com/api/products/subcategories/${params.id}`, {
        method: "PUT",
        body: form,
      })

      if (!res.ok) throw new Error("Failed to update sub-category")

      toast({
        title: "Success",
        description: "Sub-category updated successfully",
      })
      router.push("/admin-products/subcategories")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update sub-category",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading sub-category...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout>
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin-products/subcategories">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sub Categories
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Edit Sub Category</h1>
          <p className="text-muted-foreground mt-2">Update sub-category details</p>
        </div>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Sub Category Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Org Code + Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               
                <div className="space-y-2">
                  <Label htmlFor="catId">Category *</Label>
                  <Select
                    value={formData.catId}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, catId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.Id} value={category.Id.toString()}>
                          {category.CatName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Sub Category Name */}
              <div className="space-y-2">
                <Label htmlFor="subCatName">Sub Category Name *</Label>
                <Input
                  id="subCatName"
                  placeholder="Enter sub-category name"
                  value={formData.subCatName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, subCatName: e.target.value }))}
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter sub-category description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-4">
                <Label>Sub Category Image</Label>
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
                      <p className="text-sm text-muted-foreground mb-2">Click to upload or drag and drop</p>
                      <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                      <Input type="file" accept="image/*" onChange={handleImageChange} className="mt-2" />
                    </div>
                  )}
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="status"
                  checked={formData.status}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, status: checked }))}
                />
                <Label htmlFor="status">Active Status</Label>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={loading}>
                  {loading ? "Updating..." : "Update Sub Category"}
                </Button>
                <Link href="/admin-products/subcategories">
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
