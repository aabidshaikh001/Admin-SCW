"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Search, Star, User, Tag, Calendar, Eye } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { apiService, type BlogPost, type BlogAuthor, type BlogCategory } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export function BlogManager() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [blogs, setBlogs] = useState<BlogPost[]>([])
  const [authors, setAuthors] = useState<BlogAuthor[]>([])
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [filterAuthor, setFilterAuthor] = useState<string>("all")
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null)

  const [newBlog, setNewBlog] = useState<Partial<BlogPost>>({
    title: "",
    content: "",
    category: "",
    thumbnail: "",
    image: "",
    featured: false,
    authorId: 0,
    categoryId: 0,
    isActive: true,
  })

  useEffect(() => {
    if (user?.OrgCode) {
      fetchData()
    }
  }, [user?.OrgCode])

  const fetchData = async () => {
    if (!user?.OrgCode) return

    try {
      setLoading(true)
      const [blogsData, authorsData, categoriesData] = await Promise.all([
        apiService.getBlogsByOrg(user.OrgCode.toString()),
        apiService.getAuthorsByOrg(user.OrgCode.toString()),
        apiService.getCategoriesByOrg(user.OrgCode.toString()),
      ])

      setBlogs(blogsData)
      setAuthors(authorsData)
      setCategories(categoriesData)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "Failed to fetch blog data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBlog = async () => {
    if (!user?.OrgCode || !newBlog.title || !newBlog.content || !newBlog.authorId || !newBlog.categoryId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      await apiService.createBlog({
        ...newBlog,
        OrgCode: user.OrgCode,
      } as BlogPost)

      toast({
        title: "Success",
        description: "Blog created successfully",
      })

      setIsCreateModalOpen(false)
      setNewBlog({
        title: "",
        content: "",
        category: "",
        thumbnail: "",
        image: "",
        featured: false,
        authorId: 0,
        categoryId: 0,
        isActive: true,
      })
      fetchData()
    } catch (error) {
      console.error("Error creating blog:", error)
      toast({
        title: "Error",
        description: "Failed to create blog",
        variant: "destructive",
      })
    }
  }

  const handleUpdateBlog = async () => {
    if (!editingBlog?.id) return

    try {
      await apiService.updateBlog(editingBlog.id.toString(), editingBlog)

      toast({
        title: "Success",
        description: "Blog updated successfully",
      })

      setEditingBlog(null)
      fetchData()
    } catch (error) {
      console.error("Error updating blog:", error)
      toast({
        title: "Error",
        description: "Failed to update blog",
        variant: "destructive",
      })
    }
  }

  const handleDeleteBlog = async (id: number) => {
    try {
      await apiService.deleteBlog(id.toString())

      toast({
        title: "Success",
        description: "Blog deleted successfully",
      })

      fetchData()
    } catch (error) {
      console.error("Error deleting blog:", error)
      toast({
        title: "Error",
        description: "Failed to delete blog",
        variant: "destructive",
      })
    }
  }

  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch =
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === "all" || blog.categoryId.toString() === filterCategory
    const matchesAuthor = filterAuthor === "all" || blog.authorId.toString() === filterAuthor
    const matchesFeatured = !showFeaturedOnly || blog.featured

    return matchesSearch && matchesCategory && matchesAuthor && matchesFeatured
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Blog Management</h1>
          <p className="text-muted-foreground">Manage your blog posts, authors, and categories</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Create Blog Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Blog Post</DialogTitle>
              <DialogDescription>Fill in the details to create a new blog post</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={newBlog.title}
                    onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })}
                    placeholder="Enter blog title"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={newBlog.categoryId?.toString()}
                    onValueChange={(value) => setNewBlog({ ...newBlog, categoryId: Number.parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.Id} value={category.Id!.toString()}>
                          {category.CategoryName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="author">Author *</Label>
                  <Select
                    value={newBlog.authorId?.toString()}
                    onValueChange={(value) => setNewBlog({ ...newBlog, authorId: Number.parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select author" />
                    </SelectTrigger>
                    <SelectContent>
                      {authors.map((author) => (
                        <SelectItem key={author.Id} value={author.Id!.toString()}>
                          {author.Name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    id="featured"
                    checked={newBlog.featured}
                    onCheckedChange={(checked) => setNewBlog({ ...newBlog, featured: checked })}
                  />
                  <Label htmlFor="featured">Featured Post</Label>
                </div>
              </div>

              <div>
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={newBlog.content}
                  onChange={(e) => setNewBlog({ ...newBlog, content: e.target.value })}
                  placeholder="Enter blog content"
                  rows={6}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="thumbnail">Thumbnail URL</Label>
                  <Input
                    id="thumbnail"
                    value={newBlog.thumbnail}
                    onChange={(e) => setNewBlog({ ...newBlog, thumbnail: e.target.value })}
                    placeholder="Enter thumbnail URL"
                  />
                </div>
                <div>
                  <Label htmlFor="image">Featured Image URL</Label>
                  <Input
                    id="image"
                    value={newBlog.image}
                    onChange={(e) => setNewBlog({ ...newBlog, image: e.target.value })}
                    placeholder="Enter featured image URL"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateBlog}>Create Blog Post</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search blogs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
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
            <Select value={filterAuthor} onValueChange={setFilterAuthor}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by author" />
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
            <div className="flex items-center space-x-2">
              <Switch id="featured-filter" checked={showFeaturedOnly} onCheckedChange={setShowFeaturedOnly} />
              <Label htmlFor="featured-filter">Featured Only</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Blog Posts Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {filteredBlogs.map((blog, index) => (
            <motion.div
              key={blog.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2">{blog.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-2">
                        <User className="w-3 h-3" />
                        {blog.AuthorName}
                        <Tag className="w-3 h-3 ml-2" />
                        {blog.CategoryName}
                      </CardDescription>
                    </div>
                    {blog.featured && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">{blog.content}</p>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString() : "N/A"}
                    </div>
                    <Badge variant={blog.isActive ? "default" : "secondary"}>
                      {blog.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setEditingBlog(blog)} className="flex-1">
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteBlog(blog.id!)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredBlogs.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Eye className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No blogs found</h3>
            <p className="text-muted-foreground text-center">
              {searchTerm || filterCategory !== "all" || filterAuthor !== "all" || showFeaturedOnly
                ? "Try adjusting your filters to see more results."
                : "Create your first blog post to get started."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Edit Blog Modal */}
      <Dialog open={!!editingBlog} onOpenChange={() => setEditingBlog(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Blog Post</DialogTitle>
            <DialogDescription>Update the blog post details</DialogDescription>
          </DialogHeader>
          {editingBlog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-title">Title *</Label>
                  <Input
                    id="edit-title"
                    value={editingBlog.title}
                    onChange={(e) => setEditingBlog({ ...editingBlog, title: e.target.value })}
                    placeholder="Enter blog title"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-category">Category *</Label>
                  <Select
                    value={editingBlog.categoryId?.toString()}
                    onValueChange={(value) => setEditingBlog({ ...editingBlog, categoryId: Number.parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.Id} value={category.Id!.toString()}>
                          {category.CategoryName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-author">Author *</Label>
                  <Select
                    value={editingBlog.authorId?.toString()}
                    onValueChange={(value) => setEditingBlog({ ...editingBlog, authorId: Number.parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select author" />
                    </SelectTrigger>
                    <SelectContent>
                      {authors.map((author) => (
                        <SelectItem key={author.Id} value={author.Id!.toString()}>
                          {author.Name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    id="edit-featured"
                    checked={editingBlog.featured}
                    onCheckedChange={(checked) => setEditingBlog({ ...editingBlog, featured: checked })}
                  />
                  <Label htmlFor="edit-featured">Featured Post</Label>
                </div>
              </div>

              <div>
                <Label htmlFor="edit-content">Content *</Label>
                <Textarea
                  id="edit-content"
                  value={editingBlog.content}
                  onChange={(e) => setEditingBlog({ ...editingBlog, content: e.target.value })}
                  placeholder="Enter blog content"
                  rows={6}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-thumbnail">Thumbnail URL</Label>
                  <Input
                    id="edit-thumbnail"
                    value={editingBlog.thumbnail || ""}
                    onChange={(e) => setEditingBlog({ ...editingBlog, thumbnail: e.target.value })}
                    placeholder="Enter thumbnail URL"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-image">Featured Image URL</Label>
                  <Input
                    id="edit-image"
                    value={editingBlog.image || ""}
                    onChange={(e) => setEditingBlog({ ...editingBlog, image: e.target.value })}
                    placeholder="Enter featured image URL"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-active"
                  checked={editingBlog.isActive}
                  onCheckedChange={(checked) => setEditingBlog({ ...editingBlog, isActive: checked })}
                />
                <Label htmlFor="edit-active">Active</Label>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setEditingBlog(null)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateBlog}>Update Blog Post</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
