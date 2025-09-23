"use client"

import type React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs" // make sure you have your Tabs components
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Save, Loader2, Upload, X, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useAuth } from "@/contexts/auth-context"
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


interface Product {
  Id: number
  OrgCode: number
  Code: string
  CatId: number
  SubCatId?: number
  ProductName: string
  Description?: string
  ModelNo?: string
  Brand?: string
  Uses?: string
  Warranty?: string
  Delivery?: string
  Details?: string
  Image1?: string
  Image2?: string
  Image3?: string
  Image4?: string
  Brochure?: string
  Status: boolean
}

interface Category {
  Id: number
  CatName: string
}

interface SubCategory {
  Id: number
  CatId: number
  SubCatName: string
}

export default function EditProductPage() {
  const { user } = useAuth()
  const orgCode = user?.OrgCode || ""
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [subCategories, setSubCategories] = useState<SubCategory[]>([])
  const [filteredSubCategories, setFilteredSubCategories] = useState<SubCategory[]>([])
  const [imagePreviews, setImagePreviews] = useState<{ [key: string]: string }>({})

  // Fixed formData structure to match API response
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
    if (params.id) {
      fetchData()
    }
  }, [params.id])

  useEffect(() => {
    if (formData.catId) {
      const filtered = subCategories.filter((sub) => sub.CatId === Number(formData.catId))
      setFilteredSubCategories(filtered)
      if (!filtered.find((sub) => sub.Id.toString() === formData.subCatId)) {
        setFormData((prev) => ({ ...prev, subCatId: "" }))
      }
    } else {
      setFilteredSubCategories([])
    }
  }, [formData.catId, subCategories])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [categoriesResponse, subCategoriesResponse, productResponse] = await Promise.all([
        fetch(`https://api.smartcorpweb.com/api/products/categories/${orgCode}`),
        fetch(`https://api.smartcorpweb.com/api/products/subcategories/${orgCode}`),
        fetch(`https://api.smartcorpweb.com/api/products/products/${params.id}`),
      ])

      if (!categoriesResponse.ok || !subCategoriesResponse.ok || !productResponse.ok) {
        throw new Error("Failed to fetch data")
      }

      const categoriesData = await categoriesResponse.json()
      const subCategoriesData = await subCategoriesResponse.json()
      const productData = await productResponse.json()

      console.log("Product data:", productData) // Debug log

      // Properly map API response to formData
      if (productData.data) {
        const product = productData.data
       setFormData({
  orgCode: orgCode,
  code: product.Code || "",
  catId: product.CatId?.toString() || "",
  subCatId: product.SubCatId?.toString() || "",
  productName: product.ProductName || "",
  description: product.Description || "",
  modelNo: product.ModelNo || "",
  brand: product.Brand || "",
  uses: product.Uses || "",
  warranty: product.Warranty || "",
  delivery: product.Delivery || "",
  details: product.Details || "",
  status: product.Status !== undefined ? product.Status : true,
  image1: null,
  image2: null,
  image3: null,
  image4: null,
  brochure: null, // keep this for new uploads
})

// Store brochure preview
if (product.Brochure) {
  setImagePreviews((prev) => ({
    ...prev,
    brochure: `https://api.smartcorpweb.com${product.Brochure}`,
  }))
}


        // Set image previews for existing images
        const previews: { [key: string]: string } = {}
        if (product.Image1) previews.image1 = `https://api.smartcorpweb.com${product.Image1}`
        if (product.Image2) previews.image2 = `https://api.smartcorpweb.com${product.Image2}`
        if (product.Image3) previews.image3 = `https://api.smartcorpweb.com${product.Image3}`
        if (product.Image4) previews.image4 = `https://api.smartcorpweb.com${product.Image4}`
        setImagePreviews(previews)

        setCategories(categoriesData.data || [])
        setSubCategories(subCategoriesData.data || [])
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "Failed to load product data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
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
  e.preventDefault()

  if (!formData.productName.trim() || !formData.code.trim() || !formData.catId) {
    toast({
      title: "Validation Error",
      description: "Please fill in all required fields",
      variant: "destructive",
    })
    return
  }

  try {
    setSaving(true)
    
    // Use FormData to handle file uploads
    const formDataToSend = new FormData()
    
    // Append all text fields
    formDataToSend.append('OrgCode', orgCode)
    formDataToSend.append('Code', formData.code)
    formDataToSend.append('CatId', formData.catId)
    formDataToSend.append('SubCatId', formData.subCatId || '')
    formDataToSend.append('ProductName', formData.productName)
    formDataToSend.append('Description', formData.description)
    formDataToSend.append('ModelNo', formData.modelNo)
    formDataToSend.append('Brand', formData.brand)
    formDataToSend.append('Uses', formData.uses)
    formDataToSend.append('Warranty', formData.warranty)
    formDataToSend.append('Delivery', formData.delivery)
    formDataToSend.append('Details', formData.details)
    formDataToSend.append('Status', formData.status.toString())

    // Append files only if they are selected
    if (formData.image1) formDataToSend.append('image1', formData.image1)
    if (formData.image2) formDataToSend.append('image2', formData.image2)
    if (formData.image3) formDataToSend.append('image3', formData.image3)
    if (formData.image4) formDataToSend.append('image4', formData.image4)
    if (formData.brochure) formDataToSend.append('brochure', formData.brochure)

    const response = await fetch(`https://api.smartcorpweb.com/api/products/products/${params.id}`, {
      method: "PUT",
      body: formDataToSend, // No Content-Type header - let browser set it with boundary
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to update product")
    }

    toast({
      title: "Success",
      description: "Product updated successfully",
    })

    router.push("/admin-products/products")
  } catch (error) {
    console.error("Error updating product:", error)
    toast({
      title: "Error",
      description: error.message || "Failed to update product",
      variant: "destructive",
    })
  } finally {
    setSaving(false)
  }
}
  if (loading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading product...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

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
          />
        </div>
      )}
    </div>
  </div>
)
return (
    <DashboardLayout>
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin-products/products">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Edit Product</h1>
          <p className="text-muted-foreground mt-2">update product to your catalog</p>
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
    {imagePreviews.brochure ? (
      <div className="flex items-center justify-between bg-muted/30 p-2 rounded-md">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          <span>Brochure selected: {formData.brochure?.name || 'Existing brochure'}</span>
        </div>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={() => {
            setFormData(prev => ({ ...prev, brochure: null }))
            setImagePreviews(prev => {
              const { brochure, ...rest } = prev
              return rest
            })
          }}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    ) : (
      <div className="text-center">
        <FileText className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
        <p className="text-xs text-muted-foreground mb-2">Upload product brochure (PDF)</p>
        <Input
          type="file"
          accept=".pdf"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) {
              setFormData(prev => ({ ...prev, brochure: file }))
              // For PDFs, we can't create a data URL preview like images
              setImagePreviews(prev => ({ ...prev, brochure: 'pdf' }))
            }
          }}
          className="text-sm"
        />
      </div>
    )}
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
                    {loading ? "Updating..." : "Update Product"}
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
