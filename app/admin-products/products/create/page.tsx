"use client"

import type React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs" // make sure you have your Tabs components
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
import { ArrowLeft, Upload, X, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useAuth } from "@/contexts/auth-context" // Make sure this path is correct
import dynamic from "next/dynamic"
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false })
import "react-quill/dist/quill.snow.css"
const modules = {
  toolbar: [
    [{ font: [] }, { size: [] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ script: "sub" }, { script: "super" }],
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ align: [] }],
    ["blockquote", "code-block"],
    [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
    ["link", "image", "video"],
    ["formula"],
    // ["table"],  <-- remove this line
    ["clean"],
  ],
  clipboard: { matchVisual: false },
  history: { delay: 2000, maxStack: 500, userOnly: true },
};


interface Category {
  Id: number
  CatName: string
}

interface SubCategory {
  Id: number
  SubCatName: string
}

export default function CreateProductPage() {
    const { user } = useAuth()
        const orgCode = user?.OrgCode || 1000
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [subCategories, setSubCategories] = useState<SubCategory[]>([])
  const [imagePreviews, setImagePreviews] = useState<{ [key: string]: string }>({})
  const [formData, setFormData] = useState({
    orgCode: orgCode,
    code: "",
    catId: "",
    subCatId: "",
    productName: "",
    description: "",
    modelNo: "",
    brand: "",
    uses: "",
    warranty: "",
    delivery: "",
    details: "",
    status: true,
    image1: null as File | null,
    image2: null as File | null,
    image3: null as File | null,
    image4: null as File | null,
    brochure: null as File | null,
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (formData.catId) {
      fetchSubCategories(Number.parseInt(formData.catId))
    } else {
      setSubCategories([])
      setFormData((prev) => ({ ...prev, subCatId: "" }))
    }
  }, [formData.catId])

  const fetchCategories = async () => {
  try {
    const res = await fetch(`https://api.smartcorpweb.com/api/products/categories/${orgCode}`)
    if (!res.ok) throw new Error("Failed to fetch categories")
    const json = await res.json()
    setCategories(json.data) // <-- use json.data
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to fetch categories",
      variant: "destructive",
    })
  }
}

const fetchSubCategories = async (catId: number) => {
  try {
    const res = await fetch(`https://api.smartcorpweb.com/api/products/subcategories/${orgCode}/${catId}`)
    if (!res.ok) throw new Error("Failed to fetch subcategories")
    const json = await res.json()
    setSubCategories(json.data) // <-- use json.data
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to fetch sub-categories",
      variant: "destructive",
    })
  }
}

  const handleImageChange = (imageKey: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData((prev) => ({ ...prev, [imageKey]: file }))
      const reader = new FileReader()
      reader.onload = () => setImagePreviews((prev) => ({ ...prev, [imageKey]: reader.result as string }))
      reader.readAsDataURL(file)
    }
  }

  const removeImage = (imageKey: string) => {
    setFormData((prev) => ({ ...prev, [imageKey]: null }))
    setImagePreviews((prev) => {
      const newPreviews = { ...prev }
      delete newPreviews[imageKey]
      return newPreviews
    })
  }

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!formData.orgCode || !formData.code || !formData.catId || !formData.productName || !formData.image1) {
    toast({
      title: "Error",
      description: "Organization Code, Product Code, Category, Product Name, and at least one image are required",
      variant: "destructive",
    });
    return;
  }

  setLoading(true);
  try {
    const form = new FormData();
    
    // Append all fields with correct names that match the backend expectations
    form.append("OrgCode", formData.orgCode);
    form.append("Code", formData.code);
    form.append("CatId", formData.catId);
    form.append("SubCatId", formData.subCatId || "");
    form.append("ProductName", formData.productName);
    form.append("Description", formData.description);
    form.append("ModelNo", formData.modelNo);
    form.append("Brand", formData.brand);
    form.append("Uses", formData.uses);
    form.append("Warranty", formData.warranty);
    form.append("Delivery", formData.delivery);
    form.append("Details", formData.details);
    form.append("Status", formData.status.toString());

    // Append files with correct field names
    if (formData.image1) form.append("image1", formData.image1);
    if (formData.image2) form.append("image2", formData.image2);
    if (formData.image3) form.append("image3", formData.image3);
    if (formData.image4) form.append("image4", formData.image4);
    if (formData.brochure) form.append("brochure", formData.brochure);

    console.log("FormData entries:");
    for (let [key, value] of form.entries()) {
      console.log(key, value);
    }

    const res = await fetch("https://api.smartcorpweb.com/api/products/products", {
      method: "POST",
      body: form,
      // Don't set Content-Type header - browser will set it with boundary
    });

    const responseText = await res.text();
    console.log("Response:", responseText);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${responseText}`);
    }

    const data = JSON.parse(responseText);

    toast({
      title: "Success",
      description: "Product created successfully",
    });
    router.push("/admin-products/products");
  } catch (error) {
    console.error("Submission error:", error);
    toast({
      title: "Error",
      description: "Failed to create product: " + error.message,
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
};
 const ImageUploadField = ({
  imageKey,
  label,
  required = false,
}: { imageKey: string; label: string; required?: boolean }) => (
  <div className="space-y-4">
    <Label>
      {label} {required && "*"}
    </Label>
    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
      {imagePreviews[imageKey] ? (
        <div className="relative">
          <img
            src={imagePreviews[imageKey] || "/placeholder.svg"}
            alt="Preview"
            className="w-full h-32 object-cover rounded-lg"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={() => removeImage(imageKey)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div className="text-center">
          <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
          <p className="text-xs text-muted-foreground mb-2">Click to upload image</p>
          <Input 
            type="file" 
            accept="image/*" 
            onChange={(e) => handleImageChange(imageKey, e)} 
            className="text-sm" 
            name={imageKey} // Add name attribute
          />
        </div>
      )}
    </div>
  </div>
);
  return (
    <DashboardLayout>
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
                <div>
          <h1 className="text-2xl font-bold text-foreground">Create Product</h1>
        </div>
      </div>

      <div className="max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                  <Label htmlFor="code">Product Code *</Label>
                  <Input
                    id="code"
                    placeholder="Enter product code"
                    value={formData.code}
                    onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="productName">Product Name *</Label>
                  <Input
                    id="productName"
                    placeholder="Enter product name"
                    value={formData.productName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, productName: e.target.value }))}
                    required
                  />
                </div>
              </div>

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
                <div className="space-y-2">
                  <Label htmlFor="subCatId">Sub Category</Label>
                  <Select
                    value={formData.subCatId}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, subCatId: value }))}
                    disabled={!formData.catId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sub-category" />
                    </SelectTrigger>
                    <SelectContent>
                      {subCategories.map((subCategory) => (
                        <SelectItem key={subCategory.Id} value={subCategory.Id.toString()}>
                          {subCategory.SubCatName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter product description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Product Details */}
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="modelNo">Model Number</Label>
                  <Input
                    id="modelNo"
                    placeholder="Enter model number"
                    value={formData.modelNo}
                    onChange={(e) => setFormData((prev) => ({ ...prev, modelNo: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    placeholder="Enter brand name"
                    value={formData.brand}
                    onChange={(e) => setFormData((prev) => ({ ...prev, brand: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="warranty">Warranty</Label>
                  <Input
                    id="warranty"
                    placeholder="Enter warranty information"
                    value={formData.warranty}
                    onChange={(e) => setFormData((prev) => ({ ...prev, warranty: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="delivery">Delivery</Label>
                  <Input
                    id="delivery"
                    placeholder="Enter delivery information"
                    value={formData.delivery}
                    onChange={(e) => setFormData((prev) => ({ ...prev, delivery: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="uses">Uses</Label>
                <Textarea
                  id="uses"
                  placeholder="Enter product uses"
                  value={formData.uses}
                  onChange={(e) => setFormData((prev) => ({ ...prev, uses: e.target.value }))}
                  rows={2}
                />
              </div>

<div className="space-y-2">
  <Label htmlFor="details">Additional Details(HTML)</Label>

  <Tabs defaultValue="edit" className="border rounded-md">
    <TabsList>
      <TabsTrigger value="edit">Edit</TabsTrigger>
      <TabsTrigger value="full-preview">Preview</TabsTrigger>
    </TabsList>

    {/* Edit Tab */}
    <TabsContent value="edit">
      <ReactQuill
        theme="snow"
        value={formData.details}
        onChange={(value) => setFormData((prev) => ({ ...prev, details: value }))}
        modules={modules}
        className="bg-white min-h-[150px]"
      />
    </TabsContent>

    {/* Preview Tab */}
    <TabsContent value="full-preview">
      <div
        className="border p-4 min-h-[150px] bg-gray-50 rounded-md overflow-auto"
        dangerouslySetInnerHTML={{ __html: formData.details || "<p>No content yet</p>" }}
      />
    </TabsContent>
  </Tabs>
</div>
            </CardContent>
          </Card>

          {/* Images and Files */}
          <Card>
            <CardHeader>
              <CardTitle>Images and Files</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ImageUploadField imageKey="image1" label="Primary Image" required />
                <ImageUploadField imageKey="image2" label="Secondary Image" />
                <ImageUploadField imageKey="image3" label="Third Image" />
                <ImageUploadField imageKey="image4" label="Fourth Image" />
              </div>

              <div className="space-y-4">
                <Label>Product Brochure</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                  <div className="text-center">
                    <FileText className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground mb-2">Upload product brochure (PDF)</p>
                    <Input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) setFormData((prev) => ({ ...prev, brochure: file }))
                      }}
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status and Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="status"
                    checked={formData.status}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, status: checked }))}
                  />
                  <Label htmlFor="status">Active Status</Label>
                </div>

                <div className="flex gap-4">
                  <Link href="/admin-products/products">
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </Link>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Create Product"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
    </DashboardLayout>
  )
}
