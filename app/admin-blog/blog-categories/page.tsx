"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Search, Filter, Plus, Edit, Trash2, Tag, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { DashboardLayout } from "@/components/dashboard-layout"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"

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

export default function CategoriesPage() {
      const { user, isLoading } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    filterCategories()
  }, [searchTerm, statusFilter, categories])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      // Replace with your actual API call
      const response = await fetch(`https://api.smartcorpweb.com/api/blog/categories/org/${user?.OrgCode}`)
      const result = await response.json()

      if (result.success && result.data) {
        setCategories(result.data)
      } else {
        setCategories([])
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
      toast({
        title: "Error",
        description: "Failed to fetch categories",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterCategories = () => {
    let filtered = categories

    if (searchTerm) {
      filtered = filtered.filter(
        (category) =>
          category.CategoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (category.Description && category.Description.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    if (statusFilter !== "All") {
      const isActive = statusFilter === "Active"
      filtered = filtered.filter((category) => category.IsActive === isActive)
    }

    setFilteredCategories(filtered)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this category?")) return

    try {
      const response = await fetch(`https://api.smartcorpweb.com/api/blog/category/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete category")

      toast({
        title: "Success",
        description: "Category deleted successfully",
      })
      fetchCategories()
    } catch (error) {
      console.error("Error deleting category:", error)
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
        Active
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">
        Inactive
      </Badge>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
      {/* Header */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
>
  {/* Left side: Title + Search */}
  <div className="flex items-center gap-4 w-full sm:w-auto">
    <h1 className="text-3xl font-bold text-foreground">Categories</h1>

    {/* Search bar in header */}
    <div className="relative w-full sm:w-64">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
      <Input
        placeholder="Search categories..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-10"
      />
    </div>
  </div>

  {/* Right side: New button */}
  <Link href="/admin-blog/blog-categories/edit/new">
    <Button className="bg-primary hover:bg-primary/90">
      <Plus className="w-4 h-4 mr-2" />
      New
    </Button>
  </Link>
</motion.div>

        {/* Filters */}
        <Card>
         
        
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="animate-pulse flex space-x-4 p-3 border rounded-lg">
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="text-center py-8">
                <Tag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground">No categories found</h3>
                <p className="text-sm text-muted-foreground">
                  {searchTerm || statusFilter !== "All"
                    ? "Try adjusting your search or filters"
                    : "Get started by creating your first category"}
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCategories.map((category) => (
                      <TableRow key={category.Id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {category.Img ? (
                            <img
  src={`https://api.smartcorpweb.com${category.Img}`}
  alt={category.CategoryName}
  className="w-10 h-10 rounded-full object-cover"
/>

                            ) : (
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <Tag className="w-5 h-5 text-primary" />
                              </div>
                            )}
                            <div>
                              <div className="font-medium">{category.CategoryName}</div>
                              <div className="text-sm text-muted-foreground">ID: {category.Id}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <p className="text-sm line-clamp-2">{category.Description || "No description provided"}</p>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(category.IsActive)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {new Date(category.TransDate).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/admin-blog/blog-categories/edit/${category.Id}`}>
                              <Button variant="outline" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(category.Id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          
        </Card>
      </div>
    </DashboardLayout>
  )
}
