"use client"

import type React from "react"
import { useState, useEffect, ChangeEvent } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save, Eye } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"
import { DashboardLayout } from "@/components/dashboard-layout"

interface Feature {
  id: number
  OrgCode: number
  title: string
  titleColor: string
  subTitle: string
  subTitleColor: string
  description: string
  descriptionColor: string
  isButton: boolean
  buttonText?: string
  buttonColor?: string
  buttonURL?: string
  Img?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function EditFeaturePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user } = useAuth()
  const orgCode = user?.OrgCode

  const [formData, setFormData] = useState({
    title: "",
    titleColor: "#000000",
    subTitle: "",
    subTitleColor: "#666666",
    description: "",
    descriptionColor: "#888888",
    isButton: false,
    buttonText: "",
    buttonColor: "#007bff",
    buttonURL: "",
    Img: "",
    isActive: true,
  })
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>("")

  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    if (orgCode && params.id) {
      fetchFeature()
    }
  }, [orgCode, params.id])

  const fetchFeature = async () => {
    try {
      const response = await fetch(`https://api.smartcorpweb.com/api/projects/${params.id}?OrgCode=${orgCode}`)
      if (response.ok) {
        const feature: Feature = await response.json()
       setFormData({
  title: feature.title,
  titleColor: feature.titleColor,
  subTitle: feature.subTitle,
  subTitleColor: feature.subTitleColor,
  description: feature.description,
  descriptionColor: feature.descriptionColor,
  isButton: feature.isButton,
  buttonText: feature.buttonText || "",
  buttonColor: feature.buttonColor || "#007bff",
  buttonURL: feature.buttonURL || "",
  Img: feature.Img || "",
  isActive: feature.isActive,
})
// FIX: prepend server URL for preview
if (feature.Img) {
  setPreview(`https://api.smartcorpweb.com${feature.Img}`)
}
      } else {
        throw new Error("Failed to fetch Projects")
      }
    } catch (error) {
      console.error("Error fetching Projects:", error)
      toast({
        title: "Error",
        description: "Failed to fetch Projects details",
        variant: "destructive",
      })
      router.push("/admin-kra/projects")
    } finally {
      setInitialLoading(false)
    }
  }

 const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
  const selectedFile = e.target.files?.[0] || null
  setFile(selectedFile)
  if (selectedFile) {
    setPreview(URL.createObjectURL(selectedFile))
  } else if (formData.Img) {
    // keep showing old image if no new file selected
    setPreview(`https://api.smartcorpweb.com${formData.Img}`)
  }
}

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orgCode) return

    try {
      setLoading(true)
      const form = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        form.append(key, value as string)
      })
      if (file) {
        form.append("Img", file)
      }

      const response = await fetch(
        `https://api.smartcorpweb.com/api/projects/${params.id}?OrgCode=${orgCode}`,
        {
          method: "PUT",
          body: form,
        }
      )

      if (response.ok) {
        toast({
          title: "Success",
          description: "Projects updated successfully",
        })
        router.push("/admin-kra/projects")
      } else {
        throw new Error("Failed to update Projects")
      }
    } catch (error) {
      console.error("Error updating Projects:", error)
      toast({
        title: "Error",
        description: "Failed to update Projects",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
         
          <div>
            <h1 className="text-2xl font-bold text-foreground">Projects Management(Update)</h1>
           
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Projects Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* title */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="titleColor">Title Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="titleColor"
                        type="color"
                        value={formData.titleColor}
                        onChange={(e) => setFormData({ ...formData, titleColor: e.target.value })}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={formData.titleColor}
                        onChange={(e) => setFormData({ ...formData, titleColor: e.target.value })}
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                </div>

                {/* subtitle */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="subTitle">Subtitle *</Label>
                    <Input
                      id="subTitle"
                      value={formData.subTitle}
                      onChange={(e) => setFormData({ ...formData, subTitle: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="subTitleColor">Subtitle Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="subTitleColor"
                        type="color"
                        value={formData.subTitleColor}
                        onChange={(e) => setFormData({ ...formData, subTitleColor: e.target.value })}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={formData.subTitleColor}
                        onChange={(e) => setFormData({ ...formData, subTitleColor: e.target.value })}
                        placeholder="#666666"
                      />
                    </div>
                  </div>
                </div>

                {/* description */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="descriptionColor">Description Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="descriptionColor"
                        type="color"
                        value={formData.descriptionColor}
                        onChange={(e) => setFormData({ ...formData, descriptionColor: e.target.value })}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={formData.descriptionColor}
                        onChange={(e) => setFormData({ ...formData, descriptionColor: e.target.value })}
                        placeholder="#888888"
                      />
                    </div>
                  </div>
                </div>

                {/* image upload */}
                <div>
                  <Label htmlFor="image">Upload Image</Label>
                  <Input id="image" type="file" accept="image/*" onChange={handleFileChange} />
                  {preview && (
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded mt-2"
                    />
                  )}
                </div>

                {/* button options */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isButton"
                      checked={formData.isButton}
                      onCheckedChange={(checked) => setFormData({ ...formData, isButton: checked })}
                    />
                    <Label htmlFor="isButton">Include Button</Label>
                  </div>

                  {formData.isButton && (
                    <div className="grid grid-cols-2 gap-4 pl-6 border-l-2 border-muted">
                      <div>
                        <Label htmlFor="buttonText">Button Text</Label>
                        <Input
                          id="buttonText"
                          value={formData.buttonText}
                          onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                          placeholder="Learn More"
                        />
                      </div>
                      <div>
                        <Label htmlFor="buttonColor">Button Color</Label>
                        <div className="flex gap-2">
                          <Input
                            id="buttonColor"
                            type="color"
                            value={formData.buttonColor}
                            onChange={(e) => setFormData({ ...formData, buttonColor: e.target.value })}
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            value={formData.buttonColor}
                            onChange={(e) => setFormData({ ...formData, buttonColor: e.target.value })}
                            placeholder="#007bff"
                          />
                        </div>
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="buttonURL">Button URL</Label>
                        <Input
                          id="buttonURL"
                          value={formData.buttonURL}
                          onChange={(e) => setFormData({ ...formData, buttonURL: e.target.value })}
                          placeholder="https://example.com"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* active toggle */}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={loading}>
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? "Saving..." : "Save"}
                  </Button>
                  <Link href="/admin-kra/projects">
                    <Button variant="outline" type="button">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>

         <Card className="transition-transform hover:scale-[1.02] hover:shadow-lg duration-300">
  <CardHeader className="border-b pb-2">
    <CardTitle className="flex items-center gap-2 text-lg font-semibold">
      <Eye className="w-5 h-5 text-primary" />
      Live Preview
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="border rounded-xl overflow-hidden bg-background shadow-md hover:shadow-xl transition-shadow duration-300 text-center">
      {/* Project Image */}
      {preview ? (
        <img
          src={preview}
          alt="Project Preview"
          className="w-full h-52 object-cover transition-transform duration-500 hover:scale-105"
        />
      ) : (
        <div className="w-full h-52 flex items-center justify-center bg-muted">
          <span className="text-muted-foreground">No image selected</span>
        </div>
      )}

      {/* Title, Subtitle, Description, Button */}
      <div className="p-5 flex flex-col items-center">
        <h3
          className="text-xl font-bold mb-1"
          style={{ color: formData.titleColor }}
        >
          {formData.title || "Project Title"}
        </h3>
        <p
          className="text-sm mb-2"
          style={{ color: formData.subTitleColor }}
        >
          {formData.subTitle || "Project Subtitle"}
        </p>
        <p
          className="text-sm mb-4 leading-relaxed"
          style={{ color: formData.descriptionColor }}
        >
          {formData.description || "Project description will appear here..."}
        </p>

        {formData.isButton && formData.buttonText && (
          <Link href={formData.buttonURL || "#"} target="_blank">
            <Button
              className="px-5 py-2 text-sm font-medium transition-all duration-300 hover:scale-105 hover:brightness-110 rounded-lg"
              style={{ backgroundColor: formData.buttonColor }}
            >
              {formData.buttonText || "View Project"}
            </Button>
          </Link>
        )}
      </div>
    </div>
  </CardContent>
</Card>


        </div>
      </div>
    </DashboardLayout>
  )
}
