"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { ImageIcon, Save, X } from "lucide-react"
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
  title: string
  content: string
  category: string
  thumbnail?: string
  image?: string
  featured: boolean
  authorId: number
  categoryId: number
  isActive: boolean
  OrgCode?: number | string
}

export default function CreateBlogPage() {
  const { user } = useAuth()
  const [authors, setAuthors] = useState<BlogAuthor[]>([])
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

const [newBlog, setNewBlog] = useState<BlogPost>({
  title: "",
  content: "",
  category: "",
  thumbnail: "",
  image: "",
  featured: false,
  authorId: 0,
  categoryId: 0,
  isActive: true,
  OrgCode: user?.OrgCode || "",   // ✅ add this
})


  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [authorsResponse, categoriesResponse] = await Promise.all([
           fetch(`https://api.smartcorpweb.com/api/blog/authors/org/${user?.OrgCode}`),
        fetch(`https://api.smartcorpweb.com/api/blog/categories/org/${user?.OrgCode}`),
      ])

      const authorsData = await authorsResponse.json()
      const categoriesData = await categoriesResponse.json()

      if (authorsData.success) setAuthors(authorsData.data)
      if (categoriesData.success) setCategories(categoriesData.data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBlog = async () => {
  if (!newBlog.title || !newBlog.content || !newBlog.authorId || !newBlog.categoryId) {
    toast({
      title: "Error",
      description: "Please fill in all required fields",
      variant: "destructive",
    })
    return
  }

  try {
    setSaving(true)
    const response = await fetch("https://api.smartcorpweb.com/api/blog", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...newBlog,
        OrgCode: user?.OrgCode,   // ✅ always include
      }),
    })

    const data = await response.json()
    if (data.success) {
      toast({
        title: "Success",
        description: "Blog post created successfully",
      })
      router.push("/admin-blog/blog-manager")
    } else {
      throw new Error(data.message)
    }
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to create blog post",
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
        
          <div>
            <h1 className="text-3xl font-bold text-foreground">Blog (New)</h1>
        
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
                  value={newBlog.title}
                  onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })}
                  placeholder="Enter blog title"
                />
              </div>
              <div className="space-y-2">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
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
              <div className="flex items-center space-x-4 pt-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={newBlog.featured}
                    onCheckedChange={(checked) => setNewBlog({ ...newBlog, featured: checked })}
                  />
                  <Label htmlFor="featured">Featured Post</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={newBlog.isActive}
                    onCheckedChange={(checked) => setNewBlog({ ...newBlog, isActive: checked })}
                  />
                  <Label htmlFor="active">Active</Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={newBlog.content}
                onChange={(e) => setNewBlog({ ...newBlog, content: e.target.value })}
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
        {newBlog.thumbnail ? "Change Thumbnail" : "Upload Thumbnail"}
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
            const res = await fetch("https://api.smartcorpweb.com/api/blog/authors/upload", {
              method: "POST",
              body: formData,
            });
            const data = await res.json();
            if (data.success) {
              setNewBlog(prev => ({ ...prev, thumbnail: data.filePath }));
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

    {newBlog.thumbnail && (
      <div className="mt-2 flex items-center gap-2">
        <img
          src={`https://api.smartcorpweb.com${newBlog.thumbnail}`}
          alt="Thumbnail Preview"
          className="w-32 h-32 rounded object-cover border"
        />
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={() => setNewBlog(prev => ({ ...prev, thumbnail: "" }))}
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
        {newBlog.image ? "Change Image" : "Upload Image"}
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
            const res = await fetch("https://api.smartcorpweb.com/api/blog/authors/upload", {
              method: "POST",
              body: formData,
            });
            const data = await res.json();
            if (data.success) {
              setNewBlog(prev => ({ ...prev, image: data.filePath }));
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

    {newBlog.image && (
      <div className="mt-2 flex items-center gap-2">
        <img
          src={`https://api.smartcorpweb.com${newBlog.image}`}
          alt="Featured Preview"
          className="w-32 h-32 rounded object-cover border"
        />
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={() => setNewBlog(prev => ({ ...prev, image: "" }))}
        >
          Remove
        </Button>
      </div>
    )}
  </div>

</div>


            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => router.back()}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleCreateBlog} disabled={saving}>
                {saving ? (
                  <>
                    <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Create Blog Post
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
