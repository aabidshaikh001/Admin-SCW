"use client"

import  React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save, Eye, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useToast } from "@/hooks/use-toast"

interface SectionPartForm {
  OrgCode: number
  sectionName: string
  sectionColumnType: string
  sectionColumnSeq: string
  sectionColumnBGType: string
  sectionColumnBGImg: string
  sectionColumnBGVideo: string
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
  btn1Text: string
  btn1TextColor: string
  btn1BgColor: string
  btn1URL: string
  btn2Text: string
  btn2TextColor: string
  btn2BgColor: string
  btn2URL: string
  sectionBGType: string
  sectionBGColor: string
  sectionBGImg: string
  sectionBGVideo: string
  isActive: boolean
}

// Helper map for font sizes
const tagSizeMap: Record<string, string> = {
  h1: "text-4xl",
  h2: "text-3xl",
  h3: "text-2xl",
  h4: "text-xl",
  h5: "text-lg",
  h6: "text-base",
  p: "text-base",
  "24px": "text-2xl",
  "18px": "text-xl",
  "14px": "text-sm",
}

export default function EditSectionPartPage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const orgCode = user?.OrgCode || 1
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [bgImageFile, setBgImageFile] = useState<File | null>(null)
  const [bgVideoFile, setBgVideoFile] = useState<File | null>(null)
  const [columnBgImageFile, setColumnBgImageFile] = useState<File | null>(null)
  const [columnBgVideoFile, setColumnBgVideoFile] = useState<File | null>(null)

  const [formData, setFormData] = useState<SectionPartForm>({
    OrgCode: orgCode,
    sectionName: "",
    sectionColumnType: "single",
    sectionColumnSeq: "ImgRight",
    sectionColumnBGType: "color",
    sectionColumnBGImg: "",
    sectionColumnBGVideo: "",
    align: "left",
    title: "",
    titleColor: "#000000",
    titleFontSize: "h1",
    subTitle: "",
    subTitleColor: "#666666",
    subTitleFontSize: "h2",
    description: "",
    descriptionColor: "#333333",
    descriptionFontSize: "h6",
    btn1Text: "",
    btn1TextColor: "#ffffff",
    btn1BgColor: "#007bff",
    btn1URL: "",
    btn2Text: "",
    btn2TextColor: "#007bff",
    btn2BgColor: "#ffffff",
    btn2URL: "",
    sectionBGType: "color",
    sectionBGColor: "#ffffff",
    sectionBGImg: "",
    sectionBGVideo: "",
    isActive: true,
  })

  useEffect(() => {
    fetchSectionPart()
  }, [params.id])

  const fetchSectionPart = async () => {
    try {
      const response = await fetch(`https://api.smartcorpweb.com/api/section-parts/${params.id}?OrgCode=${orgCode}`)
      if (response.ok) {
        const data = await response.json()
        setFormData(data)
      } else {
        toast({
          title: "Error",
          description: "Section part not found",
          variant: "destructive",
        })
        router.push("/admin-cms/section-parts")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch section part",
        variant: "destructive",
      })
    } finally {
      setInitialLoading(false)
    }
  }

  const handleInputChange = (field: keyof SectionPartForm, value: string | number | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleFileChange = (type: "image" | "video" | "columnImage" | "columnVideo", file: File | null) => {
    if (type === "image") {
      setBgImageFile(file)
      if (file) {
        handleInputChange("sectionBGType", "image")
      }
    } else if (type === "video") {
      setBgVideoFile(file)
      if (file) {
        handleInputChange("sectionBGType", "video")
      }
    } else if (type === "columnImage") {
      setColumnBgImageFile(file)
      if (file) {
        handleInputChange("sectionColumnBGType", "image")
      }
    } else if (type === "columnVideo") {
      setColumnBgVideoFile(file)
      if (file) {
        handleInputChange("sectionColumnBGType", "video")
      }
    }
  }

  const removeFile = (type: "image" | "video" | "columnImage" | "columnVideo") => {
    if (type === "image") {
      setBgImageFile(null)
    } else if (type === "video") {
      setBgVideoFile(null)
    } else if (type === "columnImage") {
      setColumnBgImageFile(null)
    } else if (type === "columnVideo") {
      setColumnBgVideoFile(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const submitData = new FormData()

      // Normal fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "sectionBGImg" || key === "sectionBGVideo" || key === "sectionColumnBGImg" || key === "sectionColumnBGVideo") {
          // Skip here → handled separately
          return
        }
        if (typeof value === "boolean") {
          submitData.append(key, value ? "1" : "0")
        } else {
          submitData.append(key, String(value))
        }
      })

      // Handle background files
      if (bgImageFile && formData.sectionBGType === "image") {
        submitData.append("sectionBGImg", bgImageFile)
      } else if (formData.sectionBGImg) {
        // Keep old image
        submitData.append("sectionBGImg", formData.sectionBGImg)
      }

      if (bgVideoFile && formData.sectionBGType === "video") {
        submitData.append("sectionBGVideo", bgVideoFile)
      } else if (formData.sectionBGVideo) {
        // Keep old video
        submitData.append("sectionBGVideo", formData.sectionBGVideo)
      }

      // Handle column background files
      if (columnBgImageFile && formData.sectionColumnBGType === "image") {
        submitData.append("sectionColumnBGImg", columnBgImageFile)
      } else if (formData.sectionColumnBGImg) {
        // Keep old image
        submitData.append("sectionColumnBGImg", formData.sectionColumnBGImg)
      }

      if (columnBgVideoFile && formData.sectionColumnBGType === "video") {
        submitData.append("sectionColumnBGVideo", columnBgVideoFile)
      } else if (formData.sectionColumnBGVideo) {
        // Keep old video
        submitData.append("sectionColumnBGVideo", formData.sectionColumnBGVideo)
      }

      // API call
      const response = await fetch(
        `https://api.smartcorpweb.com/api/section-parts/${params.id}?OrgCode=${orgCode}`,
        {
          method: "PUT",
          body: submitData,
        }
      )

      if (!response.ok) throw new Error("Failed to update section part")

      toast({
        title: "Success",
        description: "Section part updated successfully",
      })
      router.push("/admin-cms/section-parts")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update section part",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getPreviewBackgroundImage = () => {
    if (bgImageFile) {
      return `url(${URL.createObjectURL(bgImageFile)})`
    }
    if (formData.sectionBGImg) {
      return `url(https://api.smartcorpweb.com${formData.sectionBGImg})`
    }
    return "none"
  }

  const getPreviewVideoSrc = () => {
    if (bgVideoFile) {
      return URL.createObjectURL(bgVideoFile)
    }
    if (formData.sectionBGVideo) {
      return `https://api.smartcorpweb.com${formData.sectionBGVideo}`
    }
    return null
  }

  const getColumnPreviewBackgroundImage = () => {
    if (columnBgImageFile) {
      return `url(${URL.createObjectURL(columnBgImageFile)})`
    }
    if (formData.sectionColumnBGImg) {
      return `url(https://api.smartcorpweb.com${formData.sectionColumnBGImg})`
    }
    return "none"
  }

  const getColumnPreviewVideoSrc = () => {
    if (columnBgVideoFile) {
      return URL.createObjectURL(columnBgVideoFile)
    }
    if (formData.sectionColumnBGVideo) {
      return `https://api.smartcorpweb.com${formData.sectionColumnBGVideo}`
    }
    return null
  }

  if (initialLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 max-w-6xl">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin-cms/section-parts">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Section Parts Management(Update)</h1>
         
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Column Configuration */}
       <Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Eye className="w-4 h-4" />
      Live Preview
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div
      className="p-6 rounded-lg border min-h-[300px] relative overflow-hidden"
      style={{
        backgroundColor:
          formData.sectionBGType === "color" ? formData.sectionBGColor : "#f8f9fa",
        backgroundImage: getPreviewBackgroundImage(),
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Background Video */}
      {formData.sectionBGType === "video" && getPreviewVideoSrc() && (
        <video
          className="absolute inset-0 w-full h-full object-cover rounded-lg"
          autoPlay
          loop
          muted
          src={getPreviewVideoSrc()!}
        />
      )}

      {/* Double Column Layout */}
      {formData.sectionColumnType === "double" ? (
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 h-full ${
          formData.sectionColumnSeq === "imgleft" ? "md:grid-flow-dense" : ""
        }`}>
          {/* Content Column - Order based on sectionColumnSeq */}
          <div className={`${
            formData.sectionColumnSeq === "imgleft" ? "md:col-start-2" : ""
          }`}>
            
              {/* Content */}
              <div className={`relative z-10 w-full ${formData.align === "left" ? "text-left" : formData.align === "center" ? "text-center" : "text-right"}`}>
                {formData.title && (
                  React.createElement(
                    formData.titleFontSize as keyof JSX.IntrinsicElements,
                    {
                      className: `font-bold mb-2 ${tagSizeMap[formData.titleFontSize] || "text-2xl"}`,
                      style: { color: formData.titleColor }
                    },
                    formData.title
                  )
                )}
                {formData.subTitle && (
                  React.createElement(
                    formData.subTitleFontSize as keyof JSX.IntrinsicElements,
                    {
                      className: `mb-3 ${tagSizeMap[formData.subTitleFontSize] || "text-lg"}`,
                      style: { color: formData.subTitleColor }
                    },
                    formData.subTitle
                  )
                )}
                {formData.description && (
                  React.createElement(
                    formData.descriptionFontSize as keyof JSX.IntrinsicElements,
                    {
                      className: `mb-4 ${tagSizeMap[formData.descriptionFontSize] || "text-base"}`,
                      style: { color: formData.descriptionColor }
                    },
                    formData.description
                  )
                )}
                <div
  className={`flex flex-wrap gap-2 ${
    formData.align === "left"
      ? "justify-start"
      : formData.align === "center"
      ? "justify-center"
      : "justify-end"
  }`}
>
  {formData.btn1Text && (
    <button
      className="px-4 py-2 rounded text-sm font-medium"
      style={{
        color: formData.btn1TextColor,
        backgroundColor: formData.btn1BgColor,
      }}
    >
      {formData.btn1Text}
    </button>
  )}
  {formData.btn2Text && (
    <button
      className="px-4 py-2 rounded text-sm font-medium border"
      style={{
        color: formData.btn2TextColor,
        backgroundColor: formData.btn2BgColor,
        borderColor: formData.btn2TextColor,
      }}
    >
      {formData.btn2Text}
    </button>
  )}
</div>

            </div>
          </div>

          {/* Image Column - Order based on sectionColumnSeq */}
          <div className={`${
            formData.sectionColumnSeq === "imgleft" ? "md:col-start-1" : ""
          }`}>
              <div className="relative z-10 w-full h-full flex items-center justify-center">
                <div className="rounded-md relative h-full bg-gray-100 flex items-center justify-center">
  {columnBgImageFile || formData.sectionColumnBGImg ? (
    <img
      src={
        columnBgImageFile
          ? URL.createObjectURL(columnBgImageFile)
          : `https://api.smartcorpweb.com${formData.sectionColumnBGImg}`
      }
      alt="Column Media Preview"
      className="object-contain max-h-64 w-full rounded-md"
    />
  ) : columnBgVideoFile || formData.sectionColumnBGVideo ? (
    <video
      src={
        columnBgVideoFile
          ? URL.createObjectURL(columnBgVideoFile)
          : `https://api.smartcorpweb.com${formData.sectionColumnBGVideo}`
      }
      autoPlay
      loop
      muted
      className="object-contain max-h-64 w-full rounded-md"
    />
  ) : (
    <div className="bg-gray-200 w-full h-32 rounded-md flex items-center justify-center text-gray-400">
      Image/Media Preview
    </div>
  )}
</div>

              </div>
           
          </div>
        </div>
      ) : (
        // Single Column Layout (existing code)
        <div>

          {/* Overlay content */}
          <div className={`relative z-10 flex flex-col ${formData.align === "left" ? "items-start text-left" : formData.align === "center" ? "items-center text-center" : "items-end text-right"}`}>
            {formData.title && (
              React.createElement(
                formData.titleFontSize as keyof JSX.IntrinsicElements,
                {
                  className: `font-bold mb-2 ${tagSizeMap[formData.titleFontSize] || "text-2xl"}`,
                  style: { color: formData.titleColor }
                },
                formData.title
              )
            )}
            {formData.subTitle && (
              React.createElement(
                formData.subTitleFontSize as keyof JSX.IntrinsicElements,
                {
                  className: `mb-3 ${tagSizeMap[formData.subTitleFontSize] || "text-lg"}`,
                  style: { color: formData.subTitleColor }
                },
                formData.subTitle
              )
            )}
            {formData.description && (
              React.createElement(
                formData.descriptionFontSize as keyof JSX.IntrinsicElements,
                {
                  className: `mb-4 ${tagSizeMap[formData.descriptionFontSize] || "text-base"}`,
                  style: { color: formData.descriptionColor }
                },
                formData.description
              )
            )}
           <div
  className={`flex flex-wrap gap-2 ${
    formData.align === "left"
      ? "justify-start"
      : formData.align === "center"
      ? "justify-center"
      : "justify-end"
  }`}
>
  {formData.btn1Text && (
    <button
      className="px-4 py-2 rounded text-sm font-medium"
      style={{
        color: formData.btn1TextColor,
        backgroundColor: formData.btn1BgColor,
      }}
    >
      {formData.btn1Text}
    </button>
  )}
  {formData.btn2Text && (
    <button
      className="px-4 py-2 rounded text-sm font-medium border"
      style={{
        color: formData.btn2TextColor,
        backgroundColor: formData.btn2BgColor,
        borderColor: formData.btn2TextColor,
      }}
    >
      {formData.btn2Text}
    </button>
  )}
</div>

          </div>
        </div>
      )}
    </div>
  </CardContent>
</Card>

                <CardHeader>
                  <CardTitle>Column Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="sectionColumnType">Column Type</Label>
                      <Select
                        value={formData.sectionColumnType}
                        onValueChange={(value) => handleInputChange("sectionColumnType", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single">Single Column</SelectItem>
                          <SelectItem value="double">Double Column</SelectItem>
                        
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="sectionColumnSeq">Column Sequence</Label>
                      <Select
                        value={formData.sectionColumnSeq}
                        onValueChange={(value) => handleInputChange("sectionColumnSeq", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="imgright">Image Right</SelectItem>
                          <SelectItem value="imgleft">Image Left</SelectItem>
                          
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="sectionColumnBGType">Column Background Type</Label>
                    <Select
                      value={formData.sectionColumnBGType}
                      onValueChange={(value) => handleInputChange("sectionColumnBGType", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                  
                        <SelectItem value="image">Image</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.sectionColumnBGType === "color" && (
                    <div>
                      <Label htmlFor="sectionColumnBGColor">Column Background Color</Label>
                      <Input
                        id="sectionColumnBGColor"
                        type="color"
                        value={formData.sectionBGColor}
                        onChange={(e) => handleInputChange("sectionBGColor", e.target.value)}
                      />
                    </div>
                  )}

                  {formData.sectionColumnBGType === "image" && (
                    <div className="space-y-2">
                      <Label htmlFor="columnBgImage">Column Background Image</Label>
                      {formData.sectionColumnBGImg && !columnBgImageFile && (
                        <div className="text-sm text-muted-foreground">Current: {formData.sectionColumnBGImg}</div>
                      )}
                      <div className="flex items-center gap-2">
                        <Input
                          id="columnBgImage"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange("columnImage", e.target.files?.[0] || null)}
                          className="flex-1"
                        />
                        {columnBgImageFile && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile("columnImage")}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {formData.sectionColumnBGType === "video" && (
                    <div className="space-y-2">
                      <Label htmlFor="columnBgVideo">Column Background Video</Label>
                      {formData.sectionColumnBGVideo && !columnBgVideoFile && (
                        <div className="text-sm text-muted-foreground">Current: {formData.sectionColumnBGVideo}</div>
                      )}
                      <div className="flex items-center gap-2">
                        <Input
                          id="columnBgVideo"
                          type="file"
                          accept="video/*"
                          onChange={(e) => handleFileChange("columnVideo", e.target.files?.[0] || null)}
                          className="flex-1"
                        />
                        {columnBgVideoFile && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile("columnVideo")}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
             

              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="sectionName">Section Name *</Label>
                      <Input
                        id="sectionName"
                        value={formData.sectionName}
                        onChange={(e) => handleInputChange("sectionName", e.target.value)}
                        placeholder="e.g., Hero Section, About Us"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="align">Alignment</Label>
                      <Select
                        value={formData.align}
                        onValueChange={(value) => handleInputChange("align", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="left">Left</SelectItem>
                          <SelectItem value="center">Center</SelectItem>
                          <SelectItem value="right">Right</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleInputChange("title", e.target.value)}
                        placeholder="Main title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="titleColor">Title Color</Label>
                      <Input
                        id="titleColor"
                        type="color"
                        value={formData.titleColor}
                        onChange={(e) => handleInputChange("titleColor", e.target.value)}
                      />
                    </div>
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
                        placeholder="Subtitle text"
                      />
                    </div>
                    <div>
                      <Label htmlFor="subTitleColor">Subtitle Color</Label>
                      <Input
                        id="subTitleColor"
                        type="color"
                        value={formData.subTitleColor}
                        onChange={(e) => handleInputChange("subTitleColor", e.target.value)}
                      />
                    </div>
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
                        placeholder="Section description"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="descriptionColor">Description Color</Label>
                      <Input
                        id="descriptionColor"
                        type="color"
                        value={formData.descriptionColor}
                        onChange={(e) => handleInputChange("descriptionColor", e.target.value)}
                      />
                    </div>
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

              {/* Button 1 Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle>Button 1 Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="btn1Text">Button Text</Label>
                      <Input
                        id="btn1Text"
                        value={formData.btn1Text}
                        onChange={(e) => handleInputChange("btn1Text", e.target.value)}
                        placeholder="e.g., Learn More"
                      />
                    </div>
                    <div>
                      <Label htmlFor="btn1URL">Button URL</Label>
                      <Input
                        id="btn1URL"
                        value={formData.btn1URL}
                        onChange={(e) => handleInputChange("btn1URL", e.target.value)}
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="btn1TextColor">Text Color</Label>
                      <Input
                        id="btn1TextColor"
                        type="color"
                        value={formData.btn1TextColor}
                        onChange={(e) => handleInputChange("btn1TextColor", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="btn1BgColor">Background Color</Label>
                      <Input
                        id="btn1BgColor"
                        type="color"
                        value={formData.btn1BgColor}
                        onChange={(e) => handleInputChange("btn1BgColor", e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Button 2 Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle>Button 2 Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="btn2Text">Button Text</Label>
                      <Input
                        id="btn2Text"
                        value={formData.btn2Text}
                        onChange={(e) => handleInputChange("btn2Text", e.target.value)}
                        placeholder="e.g., Contact Us"
                      />
                    </div>
                    <div>
                      <Label htmlFor="btn2URL">Button URL</Label>
                      <Input
                        id="btn2URL"
                        value={formData.btn2URL}
                        onChange={(e) => handleInputChange("btn2URL", e.target.value)}
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="btn2TextColor">Text Color</Label>
                      <Input
                        id="btn2TextColor"
                        type="color"
                        value={formData.btn2TextColor}
                        onChange={(e) => handleInputChange("btn2TextColor", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="btn2BgColor">Background Color</Label>
                      <Input
                        id="btn2BgColor"
                        type="color"
                        value={formData.btn2BgColor}
                        onChange={(e) => handleInputChange("btn2BgColor", e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Background Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle>Background Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="sectionBGType">Background Type</Label>
                    <Select
                      value={formData.sectionBGType}
                      onValueChange={(value) => handleInputChange("sectionBGType", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="color">Color</SelectItem>
                        <SelectItem value="image">Image</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.sectionBGType === "color" && (
                    <div>
                      <Label htmlFor="sectionBGColor">Background Color</Label>
                      <Input
                        id="sectionBGColor"
                        type="color"
                        value={formData.sectionBGColor}
                        onChange={(e) => handleInputChange("sectionBGColor", e.target.value)}
                      />
                    </div>
                  )}

                  {formData.sectionBGType === "image" && (
                    <div className="space-y-2">
                      <Label htmlFor="bgImage">Background Image</Label>
                      {formData.sectionBGImg && !bgImageFile && (
                        <div className="text-sm text-muted-foreground">Current: {formData.sectionBGImg}</div>
                      )}
                      <div className="flex items-center gap-2">
                        <Input
                          id="bgImage"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange("image", e.target.files?.[0] || null)}
                          className="flex-1"
                        />
                        {bgImageFile && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile("image")}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {formData.sectionBGType === "video" && (
                    <div className="space-y-2">
                      <Label htmlFor="bgVideo">Background Video</Label>
                      {formData.sectionBGVideo && !bgVideoFile && (
                        <div className="text-sm text-muted-foreground">Current: {formData.sectionBGVideo}</div>
                      )}
                      <div className="flex items-center gap-2">
                        <Input
                          id="bgVideo"
                          type="file"
                          accept="video/*"
                          onChange={(e) => handleFileChange("video", e.target.files?.[0] || null)}
                          className="flex-1"
                        />
                        {bgVideoFile && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile("video")}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Status</CardTitle>
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

              <div className="flex gap-4">
                <Button type="submit" disabled={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? "Updating..." : "Update Section Part"}
                </Button>
                <Link href="/admin-cms/section-parts">
                  <Button variant="outline">Cancel</Button>
                </Link>
              </div>
            </form>
          </div>

        
        
        </div>
      </div>
    </DashboardLayout>
  )
}