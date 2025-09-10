"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Search, Filter, Plus, Edit, Trash2, Star, User, Tag, Calendar, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"

interface BlogPost {
  id?: number
  title: string
  content: string
  category: string
  thumbnail?: string
  image?: string
  featured: boolean
  authorId: number
  categoryId: number
  isActive: boolean
  AuthorName?: string
  CategoryName?: string
  createdAt?: string
  updatedAt?: string
  OrgCode?: string
}

interface BlogAuthor {
  Id?: number
  Name: string
  Role?: string
  Bio?: string
  Img?: string   // ✅ match backend
  OrgCode?: string
}

interface BlogCategory {
  Id?: number
  CategoryName: string
  Description?: string
  Img?: string   // ✅ match backend
  OrgCode?: string
}
export default function BlogsPage() {
    const { user, isLoading } = useAuth()
  const [blogs, setBlogs] = useState<BlogPost[]>([])
  const [authors, setAuthors] = useState<BlogAuthor[]>([])
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [filteredBlogs, setFilteredBlogs] = useState<BlogPost[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterAuthor, setFilterAuthor] = useState("all")
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    filterBlogs()
  }, [searchTerm, filterCategory, filterAuthor, showFeaturedOnly, blogs])

  const fetchData = async () => {
    try {
      setLoading(true)
      // Replace with your API calls
      const [blogsResponse, authorsResponse, categoriesResponse] = await Promise.all([
        fetch(`http://localhost:5000/api/blog/org/${user?.OrgCode}`),
        fetch(`http://localhost:5000/api/blog/authors/org/${user?.OrgCode}`),
        fetch(`http://localhost:5000/api/blog/categories/org/${user?.OrgCode}`),
      ])

      const blogsData = await blogsResponse.json()
      const authorsData = await authorsResponse.json()
      const categoriesData = await categoriesResponse.json()

      if (blogsData.success) setBlogs(blogsData.data)
      if (authorsData.success) setAuthors(authorsData.data)
      if (categoriesData.success) setCategories(categoriesData.data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch blog data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterBlogs = () => {
    let filtered = blogs

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (blog) =>
          blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          blog.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          blog.AuthorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          blog.CategoryName?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply category filter
    if (filterCategory !== "all") {
      filtered = filtered.filter((blog) => blog.categoryId.toString() === filterCategory)
    }

    // Apply author filter
    if (filterAuthor !== "all") {
      filtered = filtered.filter((blog) => blog.authorId.toString() === filterAuthor)
    }

    // Apply featured filter
    if (showFeaturedOnly) {
      filtered = filtered.filter((blog) => blog.featured)
    }

    setFilteredBlogs(filtered)
  }

  const handleDeleteBlog = async (id: number) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return

    try {
      const response = await fetch(`http://localhost:5000/api/blogs/${id}`, {
        method: "DELETE",
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Success",
          description: "Blog post deleted successfully",
        })
        fetchData()
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete blog post",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (isActive: boolean, featured: boolean) => {
    return (
      <div className="flex gap-1">
        <Badge variant={isActive ? "default" : "secondary"}>{isActive ? "Active" : "Inactive"}</Badge>
        {featured && (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            <Star className="w-3 h-3 mr-1" />
            Featured
          </Badge>
        )}
      </div>
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
  {/* Left: Title */}
  <div className="flex-1">
    <h1 className="text-3xl font-bold text-foreground">Blog</h1>
  </div>

  {/* Right: Search + Filters + New Button */}
  <div className="flex flex-wrap sm:flex-row gap-2 items-center">
    {/* Search */}
    <div className="relative w-full sm:w-64">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
      <Input
        placeholder="Search blogs..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-10"
      />
    </div>

    {/* Category Filter */}
    <Select value={filterCategory} onValueChange={setFilterCategory}>
      <SelectTrigger className="w-[150px]">
        <Filter className="w-4 h-4 mr-2" />
        <SelectValue placeholder="Category" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Categories</SelectItem>
        {categories.map((category) => (
          <SelectItem key={category.Id} value={category.Id!.toString()}>
            {category.CategoryName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>

    {/* Author Filter */}
    <Select value={filterAuthor} onValueChange={setFilterAuthor}>
      <SelectTrigger className="w-[150px]">
        <SelectValue placeholder="Author" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Authors</SelectItem>
        {authors.map((author) => (
          <SelectItem key={author.Id} value={author.Id!.toString()}>
            {author.Name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>

    {/* Featured Switch */}
    <div className="flex items-center space-x-1">
      <Switch id="featured-filter" checked={showFeaturedOnly} onCheckedChange={setShowFeaturedOnly} />
      <Label htmlFor="featured-filter">Featured</Label>
    </div>

    {/* New Blog Button */}
    <Button
      onClick={() => router.push("/admin-blog/blog-manager/create")}
      className="bg-primary hover:bg-primary/90"
    >
      <Plus className="w-4 h-4 mr-2" />
      New
    </Button>
  </div>
</motion.div>


        {/* Blog Posts Table */}
        <Card>
          
        
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredBlogs.length === 0 ? (
              <div className="text-center py-12">
                <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">No blog posts found</h3>
                <p className="text-sm text-muted-foreground">
                  {searchTerm || filterCategory !== "all" || filterAuthor !== "all" || showFeaturedOnly
                    ? "Try adjusting your search or filters"
                    : "Create your first blog post to get started"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                    
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBlogs.map((blog) => (
                      <TableRow key={blog.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div>
                              <p className="font-medium line-clamp-1">{blog.title}</p>
                              <p className="text-xs text-muted-foreground">ID: {blog.id}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{blog.AuthorName || "Unknown"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Tag className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{blog.CategoryName || "Uncategorized"}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(blog.isActive, blog.featured)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">
                              {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString() : "N/A"}
                            </span>
                          </div>
                        </TableCell>
                      
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" size="sm" onClick={() => router.push(`/admin-blog/blog-manager/edit/${blog.id}`)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteBlog(blog.id!)}
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
