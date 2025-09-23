"use client"

import React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save,  X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
const tagSizeMap: Record<string, string> = {
  h1: "text-4xl",
  h2: "text-3xl",
  h3: "text-2xl",
  h4: "text-xl",
  h5: "text-lg",
  h6: "text-base",
  p: "text-base",
}

interface BreadcrumbFormData {
  OrgCode: number
  pageName: string
  align: string
  title: string
  titleColor: string
  titleFontSize: string   
  subTitle: string
  subTitleColor: string
  subTitleFontSize: string  
  description: string
  descriptionColor: string
  descriptionFontSize: string 
  rtnPageName: string
  rtnPageURL: string
  pageHeaderBGType: string
  pageHeaderBGColor: string
  pageHeaderBGImg: File | null
  pageHeaderBGVideo: File | null
  currentBGImg?: string
  currentBGVideo?: string
  isActive: boolean
}



export default function CreateBreadcrumbPage() {
    const { user } = useAuth()
      const orgCode = user?.OrgCode || 1
  const router = useRouter()
  const [loading, setLoading] = useState(false)
   const [formData, setFormData] = useState<BreadcrumbFormData>({
    OrgCode: orgCode,
    pageName: "",
    align: "center",
    title: "",
    titleColor: "#000000",
    titleFontSize: "h1",   
    subTitle: "",
    subTitleColor: "#666666",
    subTitleFontSize: "h2", 
    description: "",
    descriptionColor: "#888888",
    descriptionFontSize: "p", 
    rtnPageName: "",
    rtnPageURL: "",
    pageHeaderBGType: "color",
    pageHeaderBGColor: "#ffffff",
    pageHeaderBGImg: null,
    pageHeaderBGVideo: null,
    isActive: true,
  })
  
  const handleInputChange = (field: keyof BreadcrumbFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (field: "pageHeaderBGImg" | "pageHeaderBGVideo", file: File | null) => {
    setFormData((prev) => ({ ...prev, [field]: file }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const submitData = new FormData()

         // Add all form fields
   Object.entries(formData).forEach(([key, value]) => {
  if (key === "pageHeaderBGImg" || key === "pageHeaderBGVideo") {
    if (value instanceof File) {
      submitData.append(key, value)
    } else {
      const currentKey = key === "pageHeaderBGImg" ? "currentBGImg" : "currentBGVideo"
      if (formData[currentKey as keyof BreadcrumbFormData]) {
        submitData.append(key, formData[currentKey as keyof BreadcrumbFormData] as string)
      }
    }
  } else if (key !== "currentBGImg" && key !== "currentBGVideo") {
    submitData.append(key, String(value))
  }
})

      const response = await fetch("https://api.smartcorpweb.com/api/breadcrumbs", {
        method: "POST",
        body: submitData,
      })

      if (!response.ok) throw new Error("Failed to create breadcrumb")

      toast({
        title: "Success",
        description: "Breadcrumb created successfully",
      })

      router.push("/admin-cms/breadcrumbs")
    } catch (error) {
      console.error("Error creating breadcrumb:", error)
      toast({
        title: "Error",
        description: "Failed to create breadcrumb",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }
// helper: get background image for preview
const getPreviewBackgroundImage = () => {
  if (formData.pageHeaderBGImg instanceof File) {
    return `url(${URL.createObjectURL(formData.pageHeaderBGImg)})`
  }
  if (formData.currentBGImg) {
    return `url(https://api.smartcorpweb.com/uploads/${formData.currentBGImg})`
  }
  return "none"
}

// helper: get video source for preview
const getPreviewVideoSrc = () => {
  if (formData.pageHeaderBGVideo instanceof File) {
    return URL.createObjectURL(formData.pageHeaderBGVideo)
  }
  if (formData.currentBGVideo) {
    return `https://api.smartcorpweb.com/uploads/${formData.currentBGVideo}`
  }
  return null
}

  const removeFile = (field: "pageHeaderBGImg" | "pageHeaderBGVideo") => {
    setFormData((prev) => ({ ...prev, [field]: null }))
  }

  return (
     <DashboardLayout>
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin-cms/breadcrumbs">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Breadcrumbs
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Create New Breadcrumb</h1>
            <p className="text-muted-foreground">Add a new page header and breadcrumb section</p>
          </div>
        </div>

  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Basic Information */}
              <Card>
<CardHeader>
  <CardTitle className="flex items-center gap-2">
    <span className="font-bold flex items-center gap-1">
      <span className="text-red-600 animate-pulse">🔴</span>
      Live
    </span>
    Preview
  </CardTitle>
</CardHeader>

<CardContent>
  <div
    className="rounded-lg min-h-[200px] flex flex-col justify-center items-center relative overflow-hidden"
    style={{
      backgroundColor: formData.pageHeaderBGType === "color" ? formData.pageHeaderBGColor : "#f8f9fa",
      backgroundImage: formData.pageHeaderBGType === "image" ? getPreviewBackgroundImage() : "none",
      backgroundSize: "cover",
      backgroundPosition: "center",
    }}
  >
    {formData.pageHeaderBGType === "video" && getPreviewVideoSrc() && (
      <video
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted
        loop
        src={getPreviewVideoSrc()!}
      />
    )}

    {/* Overlay */}
    <div className="absolute inset-0 bg-black/40"></div>

    {/* Foreground Content */}
    <div
      className={`relative z-10 py-10 w-full px-4 ${
        formData.align === "left"
          ? "text-left items-start"
          : formData.align === "right"
          ? "text-right items-end"
          : "text-center items-center"
      } flex flex-col`}
    >
    {/* Title */}
{formData.title &&
  React.createElement(
    formData.titleFontSize as keyof JSX.IntrinsicElements,
    {
      className: `mb-0 font-bold ${tagSizeMap[formData.titleFontSize]}`,
      style: { color: formData.titleColor },
    },
    formData.title
  )}

     {/* Subtitle */}
{formData.subTitle &&
  React.createElement(
    formData.subTitleFontSize as keyof JSX.IntrinsicElements,
    {
      className: `mb-0 font-medium ${tagSizeMap[formData.subTitleFontSize]}`,
      style: { color: formData.subTitleColor },
    },
    formData.subTitle
  )}

{/* Description */}
{formData.description &&
  React.createElement(
    formData.descriptionFontSize as keyof JSX.IntrinsicElements,
    {
      className: `mb-4 max-w-2xl ${tagSizeMap[formData.descriptionFontSize]}`,
      style: { color: formData.descriptionColor },
    },
    formData.description
  )}    {/* Breadcrumb */}
<div className="flex gap-2 text-sm font-medium">
  {formData.rtnPageName ? (
    <>
      <span
        style={{ color: "#ffffff" }}
        className="cursor-pointer hover:underline"
        onClick={() => router.push(formData.rtnPageURL || "/")}
      >
        {formData.rtnPageName}
      </span>
      <span style={{ color: "#ffffff" }}>/</span>
    </>
  ) : null}

  <span style={{ color: formData.subTitleColor || "#ffffff" }}>
    {formData.title}
  </span>
</div>

    </div>
  </div>
</CardContent>



                <CardHeader>
  <CardTitle>Basic Information</CardTitle>
</CardHeader>
<CardContent className="space-y-4">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <Label htmlFor="pageName">Page Name *</Label>
      <Input
        id="pageName"
        value={formData.pageName}
        onChange={(e) => handleInputChange("pageName", e.target.value)}
        placeholder="e.g., About Us, Contact, Services"
        required
      />
    </div>

    <div>
      <Label htmlFor="align">Align</Label>
      <Select
        value={formData.align}
        onValueChange={(value) => handleInputChange("align", value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select alignment" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="left">Left</SelectItem>
          <SelectItem value="center">Center</SelectItem>
          <SelectItem value="right">Right</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <Label htmlFor="rtnPageName">Return Page Name</Label>
      <Input
        id="rtnPageName"
        value={formData.rtnPageName}
        onChange={(e) => handleInputChange("rtnPageName", e.target.value)}
        placeholder="e.g., About Us"
      />
    </div>
    <div>
      <Label htmlFor="rtnPageURL">Return Page URL</Label>
      <Input
        id="rtnPageURL"
        value={formData.rtnPageURL}
        onChange={(e) => handleInputChange("rtnPageURL", e.target.value)}
        placeholder="e.g., /about"
      />
    </div>
  </div>
</CardContent>

              </Card>

              {/* Content */}
              <Card>
                <CardHeader>
                  <CardTitle>Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleInputChange("title", e.target.value)}
                        placeholder="Main page title"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="titleColor">Title Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={formData.titleColor}
                          onChange={(e) => handleInputChange("titleColor", e.target.value)}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={formData.titleColor}
                          onChange={(e) => handleInputChange("titleColor", e.target.value)}
                          placeholder="#000000"
                          className="flex-1"
                        />
                      </div>
                    </div>
                    {/* Title Tag */}
<div>
  <Label htmlFor="titleFontSize">Title Size</Label>
  <Select
    value={formData.titleFontSize}
    onValueChange={(value) => handleInputChange("titleFontSize", value)}
  >
    <SelectTrigger>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="h1">H1</SelectItem>
      <SelectItem value="h2">H2</SelectItem>
      <SelectItem value="h3">H3</SelectItem>
      <SelectItem value="h4">H4</SelectItem>
      <SelectItem value="h5">H5</SelectItem>
      <SelectItem value="h6">H6</SelectItem>
    </SelectContent>
  </Select>
</div>

                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="subTitle">Subtitle</Label>
                      <Input
                        id="subTitle"
                        value={formData.subTitle}
                        onChange={(e) => handleInputChange("subTitle", e.target.value)}
                        placeholder="Optional subtitle"
                      />
                    </div>
                    <div>
                      <Label htmlFor="subTitleColor">Subtitle Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={formData.subTitleColor}
                          onChange={(e) => handleInputChange("subTitleColor", e.target.value)}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={formData.subTitleColor}
                          onChange={(e) => handleInputChange("subTitleColor", e.target.value)}
                          placeholder="#666666"
                          className="flex-1"
                        />
                      </div>
                    </div>
                    {/* Subtitle Tag */}
<div>
  <Label htmlFor="subTitleFontSize">Subtitle Size</Label>
  <Select
    value={formData.subTitleFontSize}
    onValueChange={(value) => handleInputChange("subTitleFontSize", value)}
  >
    <SelectTrigger>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="h1">H1</SelectItem>
      <SelectItem value="h2">H2</SelectItem>
      <SelectItem value="h3">H3</SelectItem>
      <SelectItem value="h4">H4</SelectItem>
      <SelectItem value="h5">H5</SelectItem>
      <SelectItem value="h6">H6</SelectItem>
    </SelectContent>
  </Select>
</div>

                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        placeholder="Optional description"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="descriptionColor">Description Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={formData.descriptionColor}
                          onChange={(e) => handleInputChange("descriptionColor", e.target.value)}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={formData.descriptionColor}
                          onChange={(e) => handleInputChange("descriptionColor", e.target.value)}
                          placeholder="#888888"
                          className="flex-1"
                        />
                      </div>
                    </div>
                    {/* Description Tag */}
<div>
  <Label htmlFor="descriptionFontSize">Description Tag</Label>
  <Select
    value={formData.descriptionFontSize}
    onValueChange={(value) => handleInputChange("descriptionFontSize", value)}
  >
    <SelectTrigger>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="p">Paragraph</SelectItem>
      <SelectItem value="h1">H1</SelectItem>
      <SelectItem value="h2">H2</SelectItem>
      <SelectItem value="h3">H3</SelectItem>
      <SelectItem value="h4">H4</SelectItem>
      <SelectItem value="h5">H5</SelectItem>
      <SelectItem value="h6">H6</SelectItem>
    </SelectContent>
  </Select>
</div>

                  </div>
                </CardContent>
              </Card>

              {/* Background Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Background Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="pageHeaderBGType">Background Type</Label>
                    <Select
                      value={formData.pageHeaderBGType}
                      onValueChange={(value) => handleInputChange("pageHeaderBGType", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="color">Solid Color</SelectItem>
                        <SelectItem value="image">Background Image</SelectItem>
                        <SelectItem value="video">Background Video</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.pageHeaderBGType === "color" && (
                    <div>
                      <Label htmlFor="pageHeaderBGColor">Background Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={formData.pageHeaderBGColor}
                          onChange={(e) => handleInputChange("pageHeaderBGColor", e.target.value)}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={formData.pageHeaderBGColor}
                          onChange={(e) => handleInputChange("pageHeaderBGColor", e.target.value)}
                          placeholder="#ffffff"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  )}

                  {formData.pageHeaderBGType === "image" && (
                    <div>
                      <Label htmlFor="pageHeaderBGImg">Background Image</Label>
                      <div className="space-y-2">
                        <Input
                          id="pageHeaderBGImg"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange("pageHeaderBGImg", e.target.files?.[0] || null)}
                        />
                        {formData.pageHeaderBGImg && (
                          <div className="flex items-center gap-2 p-2 bg-muted rounded">
                            <span className="text-sm flex-1">{formData.pageHeaderBGImg.name}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile("pageHeaderBGImg")}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        {!formData.pageHeaderBGImg && formData.currentBGImg && (
                          <div className="text-sm text-muted-foreground">
                            Current: {formData.currentBGImg.split("/").pop()}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {formData.pageHeaderBGType === "video" && (
                    <div>
                      <Label htmlFor="pageHeaderBGVideo">Background Video</Label>
                      <div className="space-y-2">
                        <Input
                          id="pageHeaderBGVideo"
                          type="file"
                          accept="video/*"
                          onChange={(e) => handleFileChange("pageHeaderBGVideo", e.target.files?.[0] || null)}
                        />
                        {formData.pageHeaderBGVideo && (
                          <div className="flex items-center gap-2 p-2 bg-muted rounded">
                            <span className="text-sm flex-1">{formData.pageHeaderBGVideo.name}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile("pageHeaderBGVideo")}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        {!formData.pageHeaderBGVideo && formData.currentBGVideo && (
                          <div className="text-sm text-muted-foreground">
                            Current: {formData.currentBGVideo.split("/").pop()}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => handleInputChange("isActive", checked)}
                    />
                    <Label htmlFor="isActive">Active</Label>
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="flex gap-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? (
                    <>Creating...</>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Breadcrumb
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>

         
        </div>
      </div>
    </div>
     </DashboardLayout>
  )
}
