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
import { ArrowLeft, Upload, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useAuth } from "@/contexts/auth-context" // Make sure this path is correct

interface Category {
  Id: number
  OrgCode: number
  CatName: string
  Description?: string
  Image?: string
  Status: boolean
}

export default function EditCategoryPage({ params }: { params: { id: string } }) {
    const { user } = useAuth()
        const orgCode = user?.OrgCode || ""
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    orgCode: orgCode,
    catName: "",
    description: "",
    status: true,
    image: null as File | null,
  })

  useEffect(() => {
    fetchCategory()
  }, [params.id])

  const fetchCategory = async () => {
  try {
    setFetching(true);
    const res = await fetch(`https://api.smartcorpweb.com/api/products/category/id/${params.id}`);
    if (!res.ok) throw new Error("Failed to fetch category");
const json = await res.json();
const data: Category = json.data; // <-- use json.data instead of json directly

    setFormData({
      orgCode: data.OrgCode.toString(),
      catName: data.CatName,
      description: data.Description || "",
      status: data.Status,
      image: null,
    });

    if (data.Image) {
      setImagePreview(`https://api.smartcorpweb.com/${data.Image}`);
    }
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to fetch category",
      variant: "destructive",
    });
  } finally {
    setFetching(false);
  }
};

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
  e.preventDefault();

  if (!formData.orgCode || !formData.catName) {
    toast({
      title: "Error",
      description: "Organization Code and Category Name are required",
      variant: "destructive",
    });
    return;
  }

  setLoading(true);
  try {
    const form = new FormData();
form.append("OrgCode", formData.orgCode);
form.append("CatName", formData.catName);
form.append("Description", formData.description);
form.append("Status", formData.status.toString());

    if (formData.image) {
      form.append("image", formData.image);
    }

    const res = await fetch(`https://api.smartcorpweb.com/api/products/categories/${params.id}`, {
      method: "PUT",
      body: form,
    });

    if (!res.ok) throw new Error("Failed to update category");

    toast({
      title: "Success",
      description: "Category updated successfully",
    });
    router.push("/admin-products/categories");
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to update category",
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
};

  if (fetching) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading category...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout>
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin-products/categories">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Categories
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Edit Category</h1>
          <p className="text-muted-foreground mt-2">Update category details</p>
        </div>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Category Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               
                <div className="space-y-2">
                  <Label htmlFor="catName">Category Name *</Label>
                  <Input
                    id="catName"
                    placeholder="Enter category name"
                    value={formData.catName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, catName: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter category description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

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
                      <p className="text-sm text-muted-foreground mb-2">Click to upload or drag and drop</p>
                      <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                      <Input type="file" accept="image/*" onChange={handleImageChange} className="mt-2" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="status"
                  checked={formData.status}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, status: checked }))}
                />
                <Label htmlFor="status">Active Status</Label>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={loading}>
                  {loading ? "Updating..." : "Update Category"}
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
