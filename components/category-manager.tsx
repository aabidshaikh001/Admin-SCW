"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Tag, Calendar, Hash, ImageIcon } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

interface Category {
  Id: number
  OrgCode: number
  CategoryName: string
  Img: string
  TransDate: string
  IsDeleted: boolean
  IsActive: boolean
  // Optional description field if you want to add it
  Description?: string
}

export function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    CategoryName: "",
    Description: "",
    Img: "",
    IsActive: true
  })
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    fetchCategories()
  }, [user])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      if (user?.OrgCode) {
        const response = await fetch(`https://api.smartcorpweb.com/api/blog/categories/org/${user.OrgCode}`)
        const result = await response.json()
        
        if (result.success && result.data) {
          setCategories(result.data)
        } else {
          setCategories([])
        }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!user?.OrgCode) return

      const categoryData = {
        ...formData,
        OrgCode: user.OrgCode,
        IsDeleted: false
      }

      if (editingCategory) {
        // Update existing category
        const response = await fetch(`https://api.smartcorpweb.com/api/blog/category/${editingCategory.Id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(categoryData)
        })

        if (!response.ok) throw new Error("Failed to update category")
        
        toast({
          title: "Success",
          description: "Category updated successfully",
        })
      } else {
        // Create new category
        const response = await fetch("https://api.smartcorpweb.com/api/blog/category", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(categoryData)
        })

        if (!response.ok) throw new Error("Failed to create category")
        
        toast({
          title: "Success",
          description: "Category created successfully",
        })
      }

      resetForm()
      setIsCreateModalOpen(false)
      fetchCategories()
    } catch (error) {
      console.error("Error saving category:", error)
      toast({
        title: "Error",
        description: editingCategory ? "Failed to update category" : "Failed to create category",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      CategoryName: category.CategoryName,
      Description: category.Description || "",
      Img: category.Img,
      IsActive: category.IsActive
    })
    setIsCreateModalOpen(true)
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

  const resetForm = () => {
    setFormData({
      CategoryName: "",
      Description: "",
      Img: "",
      IsActive: true
    })
    setEditingCategory(null)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Here you would typically upload the file to your server
    // For now, we'll just use a placeholder
    toast({
      title: "Image upload",
      description: "Image upload functionality would be implemented here",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Categories</h2>
          <p className="text-muted-foreground">Organize your blog posts with categories</p>
        </div>
        <Dialog
          open={isCreateModalOpen}
          onOpenChange={(open) => {
            setIsCreateModalOpen(open)
            if (!open) resetForm()
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCategory ? "Edit Category" : "Create New Category"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="categoryName">Category Name *</Label>
                <Input
                  id="categoryName"
                  value={formData.CategoryName}
                  onChange={(e) => setFormData({ ...formData, CategoryName: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.Description}
                  onChange={(e) => setFormData({ ...formData, Description: e.target.value })}
                  rows={3}
                  placeholder="Brief description of the category..."
                />
              </div>
              <div>
                <Label htmlFor="image">Category Image</Label>
                <div className="flex gap-2">
                  <Input
                    id="image"
                    value={formData.Img}
                    onChange={(e) => setFormData({ ...formData, Img: e.target.value })}
                    placeholder="Image URL or path"
                  />
                  <Button type="button" variant="outline" onClick={() => document.getElementById('imageUpload')?.click()}>
                    <ImageIcon className="w-4 h-4" />
                  </Button>
                  <input
                    id="imageUpload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.IsActive}
                  onChange={(e) => setFormData({ ...formData, IsActive: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingCategory ? "Update" : "Create"} Category
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {categories.map((category) => (
            <motion.div
              key={category.Id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="hover:shadow-md transition-shadow h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {category.Img ? (
                        <img
                          src={category.Img || "/placeholder.svg"}
                          alt={category.CategoryName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Tag className="w-5 h-5 text-primary" />
                        </div>
                      )}
                      <CardTitle className="text-lg">{category.CategoryName}</CardTitle>
                    </div>
                    <Badge variant={category.IsActive ? "default" : "secondary"}>
                      {category.IsActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {category.Description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{category.Description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {new Date(category.TransDate).toLocaleDateString()}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(category)}>
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(category.Id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {categories.length === 0 && !loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
          <Tag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No categories found</h3>
          <p className="text-muted-foreground mb-4">Get started by creating your first category</p>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        </motion.div>
      )}
    </div>
  )
}