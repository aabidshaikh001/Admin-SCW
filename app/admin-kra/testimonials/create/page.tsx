"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Upload, Star } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function CreateTestimonialPage() {
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    content: "",
    rating: 5,
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const orgCode = user?.OrgCode

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleRatingChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      rating: Number.parseInt(value),
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!orgCode) {
      toast({
        title: "Error",
        description: "Organization code not found. Please log in again.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const submitData = new FormData()
      submitData.append("OrgCode", orgCode.toString())
      submitData.append("name", formData.name)
      submitData.append("role", formData.role)
      submitData.append("content", formData.content)
      submitData.append("rating", formData.rating.toString())

      if (imageFile) {
        submitData.append("image", imageFile)
      }

      const response = await fetch("https://api.smartcorpweb.com/api/testimonials", {
        method: "POST",
        body: submitData,
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: "Testimonial created successfully",
        })
        router.push("/admin-kra/testimonials")
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to create testimonial",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating testimonial:", error)
      toast({
        title: "Error",
        description: "Failed to create testimonial",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-5 w-5 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
    ))
  }

  if (!orgCode) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Please log in to create testimonials.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create Testimonial</h1>
            <p className="text-muted-foreground">Add a new customer testimonial</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Testimonial Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Customer Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter customer name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role/Position *</Label>
                      <Input
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., CEO, Manager, Customer"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">Testimonial Content *</Label>
                    <Textarea
                      id="content"
                      name="content"
                      value={formData.content}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter the testimonial content..."
                      rows={4}
                      maxLength={500}
                    />
                    <p className="text-sm text-muted-foreground">{formData.content.length}/500 characters</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rating">Rating *</Label>
                    <Select value={formData.rating.toString()} onValueChange={handleRatingChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 Stars - Excellent</SelectItem>
                        <SelectItem value="4">4 Stars - Very Good</SelectItem>
                        <SelectItem value="3">3 Stars - Good</SelectItem>
                        <SelectItem value="2">2 Stars - Fair</SelectItem>
                        <SelectItem value="1">1 Star - Poor</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex items-center space-x-1 mt-2">{renderStars(formData.rating)}</div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image">Customer Photo</Label>
                    <div className="flex items-center space-x-4">
                      <Input id="image" type="file" accept="image/*" onChange={handleImageChange} className="flex-1" />
                      <Upload className="h-4 w-4 text-muted-foreground" />
                    </div>
                    {imagePreview && (
                      <div className="mt-2">
                        <img
                            src={imagePreview.startsWith("data:") ? imagePreview : `https://api.smartcorpweb.com${imagePreview}`}
                          alt="Preview"
                          className="h-20 w-20 rounded-full object-cover border"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? "Creating..." : "Create Testimonial"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    {imagePreview ? (
                      <img
    src={imagePreview.startsWith("data:") ? imagePreview : `https://api.smartcorpweb.com${imagePreview}`}
    alt="Customer"
    className="h-12 w-12 rounded-full object-cover"
  />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {formData.name ? formData.name.charAt(0).toUpperCase() : "?"}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{formData.name || "Customer Name"}</p>
                      <p className="text-sm text-muted-foreground">{formData.role || "Role"}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">{renderStars(formData.rating)}</div>

                  <p className="text-sm italic">"{formData.content || "Testimonial content will appear here..."}"</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
