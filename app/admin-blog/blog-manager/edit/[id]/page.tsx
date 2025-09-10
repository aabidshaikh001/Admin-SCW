"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, X,ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useAuth } from "@/contexts/auth-context"
interface BlogAuthor {
  Id?: number
  Name: string
  Role?: string
  Bio?: string
  Image?: string
  OrgCode?: string
}

interface BlogCategory {
  Id?: number
  CategoryName: string
  Description?: string
  Image?: string
  OrgCode?: string
}

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

export default function EditBlogPage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const [blog, setBlog] = useState<BlogPost | null>(null)
  const [authors, setAuthors] = useState<BlogAuthor[]>([])
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchData()
  }, [params.id])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [blogResponse, authorsResponse, categoriesResponse] = await Promise.all([
        fetch(`http://localhost:5000/api/blog/${params.id}`),
       fetch(`http://localhost:5000/api/blog/authors/org/${user?.OrgCode}`),
        fetch(`http://localhost:5000/api/blog/categories/org/${user?.OrgCode}`),
      ])

      const blogData = await blogResponse.json()
      const authorsData = await authorsResponse.json()
      const categoriesData = await categoriesResponse.json()

      if (blogData.success) setBlog(blogData.data)
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

  const handleUpdateBlog = async () => {
    if (!blog?.title || !blog?.content || !blog?.authorId || !blog?.categoryId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      setSaving(true)
      const response = await fetch(`http://localhost:5000/api/blog/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(blog),
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Success",
          description: "Blog post updated successfully",
        })
        router.push("/admin-blog/blog-manager")
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update blog post",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!blog) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-muted-foreground">Blog post not found</h3>
          <Button onClick={() => router.push("/admin-blog/blog-manager")} className="mt-4">
            Back to Blogs
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
         
          <div>
            <h1 className="text-3xl font-bold text-foreground">Blog (Update)</h1>
         
          </div>
        </motion.div>

        {/* Form */}
        <Card>
        
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={blog.title}
                  onChange={(e) => setBlog({ ...blog, title: e.target.value })}
                  placeholder="Enter blog title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={blog.categoryId?.toString()}
                  onValueChange={(value) => setBlog({ ...blog, categoryId: Number.parseInt(value) })}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="author">Author *</Label>
                <Select
                  value={blog.authorId?.toString()}
                  onValueChange={(value) => setBlog({ ...blog, authorId: Number.parseInt(value) })}
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
              <div className="flex items-center space-x-4 pt-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={blog.featured}
                    onCheckedChange={(checked) => setBlog({ ...blog, featured: checked })}
                  />
                  <Label htmlFor="featured">Featured Post</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={blog.isActive}
                    onCheckedChange={(checked) => setBlog({ ...blog, isActive: checked })}
                  />
                  <Label htmlFor="active">Active</Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={blog.content}
                onChange={(e) => setBlog({ ...blog, content: e.target.value })}
                placeholder="Enter blog content"
                rows={8}
              />
            </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

  {/* Thumbnail Upload */}
  <div className="space-y-2">
    <Label htmlFor="thumbnailUpload">Thumbnail Image</Label>
    <div className="flex gap-2 items-center">
      <Button
        type="button"
        variant="outline"
        onClick={() => document.getElementById("thumbnailUpload")?.click()}
      >
        <ImageIcon className="w-4 h-4 mr-2" />
        {blog.thumbnail ? "Change Thumbnail" : "Upload Thumbnail"}
      </Button>
      <input
        id="thumbnailUpload"
        type="file"
        accept="image/*"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;

          const formData = new FormData();
          formData.append("image", file);

          try {
            const res = await fetch("http://localhost:5000/api/blog/categories/upload", {
              method: "POST",
              body: formData,
            });
            const data = await res.json();
            if (data.success) {
              setBlog(prev => prev ? { ...prev, thumbnail: data.filePath } : null);
              toast({ title: "Thumbnail uploaded", description: "Thumbnail uploaded successfully" });
            } else throw new Error(data.message || "Upload failed");
          } catch (err) {
            console.error(err);
            toast({ title: "Error", description: "Failed to upload thumbnail", variant: "destructive" });
          }
        }}
        className="hidden"
      />
    </div>

    {blog.thumbnail && (
      <div className="mt-2 flex items-center gap-2">
        <img
          src={`http://localhost:5000${blog.thumbnail}`}
          alt="Thumbnail Preview"
          className="w-32 h-32 rounded object-cover border"
        />
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={() => setBlog(prev => prev ? { ...prev, thumbnail: "" } : null)}
        >
          Remove
        </Button>
      </div>
    )}
  </div>

  {/* Featured Image Upload */}
  <div className="space-y-2">
    <Label htmlFor="featuredImageUpload">Featured Image</Label>
    <div className="flex gap-2 items-center">
      <Button
        type="button"
        variant="outline"
        onClick={() => document.getElementById("featuredImageUpload")?.click()}
      >
        <ImageIcon className="w-4 h-4 mr-2" />
        {blog.image ? "Change Image" : "Upload Image"}
      </Button>
      <input
        id="featuredImageUpload"
        type="file"
        accept="image/*"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;

          const formData = new FormData();
          formData.append("image", file);

          try {
            const res = await fetch("http://localhost:5000/api/blog/categories/upload", {
              method: "POST",
              body: formData,
            });
            const data = await res.json();
            if (data.success) {
              setBlog(prev => prev ? { ...prev, image: data.filePath } : null);
              toast({ title: "Image uploaded", description: "Featured image uploaded successfully" });
            } else throw new Error(data.message || "Upload failed");
          } catch (err) {
            console.error(err);
            toast({ title: "Error", description: "Failed to upload image", variant: "destructive" });
          }
        }}
        className="hidden"
      />
    </div>

    {blog.image && (
      <div className="mt-2 flex items-center gap-2">
        <img
          src={`http://localhost:5000${blog.image}`}
          alt="Featured Preview"
          className="w-32 h-32 rounded object-cover border"
        />
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={() => setBlog(prev => prev ? { ...prev, image: "" } : null)}
        >
          Remove
        </Button>
      </div>
    )}
  </div>

</div>


            {/* Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <div className="space-y-1">
                <Label className="text-muted-foreground">Created</Label>
                <p className="text-sm">{blog.createdAt ? new Date(blog.createdAt).toLocaleString() : "N/A"}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Last Updated</Label>
                <p className="text-sm">{blog.updatedAt ? new Date(blog.updatedAt).toLocaleString() : "N/A"}</p>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => router.back()}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleUpdateBlog} disabled={saving}>
                {saving ? (
                  <>
                    <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Update Blog Post
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
