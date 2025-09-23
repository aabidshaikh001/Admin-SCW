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
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, ImageIcon, Filter } from "lucide-react"
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
  CreatedAt: string
  CatName?: string
}

interface Category {
  Id: number
  CatName: string
}

export default function SubCategoriesPage() {
    const { user } = useAuth()
        const orgCode = user?.OrgCode || ""
  const [subCategories, setSubCategories] = useState<SubCategory[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [categoriesResponse, subCategoriesResponse] = await Promise.all([
        fetch("https://api.smartcorpweb.com/api/products/categories/" + orgCode),
        fetch("https://api.smartcorpweb.com/api/products/subcategories/" + orgCode),
      ])

      if (!categoriesResponse.ok || !subCategoriesResponse.ok) {
        throw new Error("Failed to fetch data")
      }

      const categoriesData = await categoriesResponse.json()
      const subCategoriesData = await subCategoriesResponse.json()

      setCategories(Array.isArray(categoriesData) ? categoriesData : [])
      setSubCategories(Array.isArray(subCategoriesData.data) ? subCategoriesData.data : [])
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "Failed to fetch sub-categories",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`https://api.smartcorpweb.com/api/products/subcategories/${orgCode}/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete sub-category")
      }

      setSubCategories((prev) => prev.filter((subCat) => subCat.Id !== id))
      toast({
        title: "Success",
        description: "Sub-category deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting sub-category:", error)
      toast({
        title: "Error",
        description: "Failed to delete sub-category",
        variant: "destructive",
      })
    }
    setDeleteId(null)
  }

  const filteredSubCategories = subCategories.filter((subCategory) => {
    const matchesSearch =
      subCategory.SubCatName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subCategory.Description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subCategory.CatName?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategory === "all" || subCategory.CatId.toString() === selectedCategory

    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading sub-categories...</p>
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
          <h1 className="text-3xl font-bold text-foreground">Sub Categories</h1>
          <p className="text-muted-foreground mt-2">Manage product sub-categories</p>
        </div>
        <Link href="/admin-products/subcategories/create">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Sub Category
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Sub Categories</CardTitle>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search sub-categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.Id} value={category.Id.toString()}>
                    {category.CatName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge variant="secondary">{filteredSubCategories.length} sub-categories</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Org Code</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubCategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="text-muted-foreground">
                        {searchTerm || selectedCategory !== "all"
                          ? "No sub-categories found matching your filters."
                          : "No sub-categories found."}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSubCategories.map((subCategory) => (
                    <TableRow key={subCategory.Id}>
                      <TableCell>
                        <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
                          {subCategory.Image ? (
                            <img
                              src={`https://api.smartcorpweb.com${subCategory.Image}`}
                              alt={subCategory.SubCatName}
                              className="w-full h-full object-cover rounded-md"
                            />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{subCategory.SubCatName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{subCategory.CatName}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {subCategory.Description || "No description"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{subCategory.OrgCode}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={subCategory.Status ? "default" : "secondary"}>
                          {subCategory.Status ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(subCategory.CreatedAt).toLocaleDateString()}
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
                              <Link href={`/admin-products/subcategories/edit/${subCategory.Id}`}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDeleteId(subCategory.Id)} className="text-destructive">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
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
              This action cannot be undone. This will permanently delete the sub-category.
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
