"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, ImageIcon, Filter, Package } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useAuth } from "@/contexts/auth-context" // Make sure this path is correct

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
  CreatedAt: string
  CategoryName?: string
  SubCategoryName?: string
}

interface Category {
  Id: number
  CatName: string
}

export default function ProductsPage() {
    const { user } = useAuth()
        const orgCode = user?.OrgCode || ""
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [categoriesResponse, productsResponse] = await Promise.all([
        fetch("https://api.smartcorpweb.com/api/products/categories/" + orgCode),
        fetch("https://api.smartcorpweb.com/api/products/products/org/" + orgCode),
      ])

      if (!categoriesResponse.ok || !productsResponse.ok) {
        throw new Error("Failed to fetch data")
      }

      const categoriesData = await categoriesResponse.json()
      const productsData = await productsResponse.json()

      setCategories(Array.isArray(categoriesData) ? categoriesData : [])
      setProducts(Array.isArray(productsData.data) ? productsData.data : [])
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`https://api.smartcorpweb.com/api/products/products/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete product")
      }

      setProducts((prev) => prev.filter((product) => product.Id !== id))
      toast({
        title: "Success",
        description: "Product deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting product:", error)
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      })
    }
    setDeleteId(null)
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.ProductName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.Description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.Brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.Code.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategory === "all" || product.CatId.toString() === selectedCategory
    const matchesStatus =
      selectedStatus === "all" ||
      (selectedStatus === "active" && product.Status) ||
      (selectedStatus === "inactive" && !product.Status)

    return matchesSearch && matchesCategory && matchesStatus
  })

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout>
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Products</h1>
       
        </div>
         <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
        <Link href="/admin-products/products/create">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
           New
          </Button>
        </Link>
      </div>

      <Card>
             <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="text-muted-foreground">
                        <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        {searchTerm || selectedCategory !== "all" || selectedStatus !== "all"
                          ? "No products found matching your filters."
                          : "No products found."}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow key={product.Id}>
                      <TableCell>
                        <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center">
                          {product.Image1 ? (
                            <img
                              src={`https://api.smartcorpweb.com${product.Image1}`}
                              alt={product.ProductName}
                              className="w-full h-full object-cover rounded-md"
                            />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{product.ProductName}</div>
                          <div className="text-sm text-muted-foreground">
                            {product.ModelNo && `Model: ${product.ModelNo}`}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.Code}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm font-medium">{product.CategoryName}</div>
                          {product.SubCategoryName && (
                            <div className="text-xs text-muted-foreground">{product.SubCategoryName}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {product.Brand ? (
                          <Badge variant="secondary">{product.Brand}</Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">No brand</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={product.Status ? "default" : "secondary"}>
                          {product.Status ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(product.CreatedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                           
                            <DropdownMenuItem asChild>
                              <Link href={`/admin-products/products/edit/${product.Id}`}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            {/* <DropdownMenuItem onClick={() => setDeleteId(product.Id)} className="text-destructive">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem> */}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </DashboardLayout>
  )
}
