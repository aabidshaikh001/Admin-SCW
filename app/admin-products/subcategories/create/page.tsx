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

interface Category {
  Id: number
  CatName: string
}

export default function CreateSubCategoryPage() {
    const { user } = useAuth()
        const orgCode = user?.OrgCode || 1000
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
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
    fetchCategories()
  }, [])

  // 🔹 Fetch categories from real API
const fetchCategories = async () => {
  try {
    const res = await fetch(`https://api.smartcorpweb.com/api/products/categories/${orgCode}`)
    if (!res.ok) throw new Error("Failed to fetch categories")

    const json = await res.json()
    setCategories(json.data) // <-- use the nested data array
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to fetch categories",
      variant: "destructive",
    })
  }
}


  // 🔹 Handle Image Upload
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

  // 🔹 Submit sub-category to backend
 // 🔹 Submit sub-category to backend - FIXED VERSION
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

    console.log('Submitting subcategory data:', {
      OrgCode: formData.orgCode,
      CatId: formData.catId,
      SubCatName: formData.subCatName,
      Status: formData.status ? "1" : "0"
    })

    const res = await fetch("https://api.smartcorpweb.com/api/products/subcategories", {
      method: "POST",
      body: form,
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: 'Unknown error' }))
      throw new Error(errorData.message || `HTTP error! status: ${res.status}`)
    }

    const result = await res.json()
    
    toast({
      title: "Success",
      description: "Sub-category created successfully",
    })
    router.push("/admin-products/subcategories")
  } catch (error) {
    console.error('Create subcategory error:', error)
    toast({
      title: "Error",
      description: error.message || "Failed to create sub-category",
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
        <Link href="/admin-products/subcategories">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sub Categories
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Create Sub Category</h1>
          <p className="text-muted-foreground mt-2">Add a new product sub-category</p>
        </div>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Sub Category Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
        
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
                  {loading ? "Creating..." : "Create Sub Category"}
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
