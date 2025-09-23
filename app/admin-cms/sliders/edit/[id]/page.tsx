"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Save, Eye } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"

interface SliderFormData {
  OrgCode: number
  aligment: string
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
  sliderBGType: string
  sliderBGColor: string
  sliderBGImg: File | null
  sliderBGVideo: File | null
  sliderSqquence: number
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
interface EditSliderPageProps {
  params: {
    id: string
  }
}

export default function EditSliderPage({ params }: EditSliderPageProps) {
       const { user } = useAuth()
  const orgCode = user?.OrgCode || 1
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [showPreview, setShowPreview] = useState(true)
  const [currentImageUrl, setCurrentImageUrl] = useState<string>("")
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string>("")

  const [formData, setFormData] = useState<SliderFormData>({
  OrgCode: orgCode,
  aligment: "center",
  title: "",
  titleColor: "#000000",
  titleFontSize: "32px",
  subTitle: "",
  subTitleColor: "#666666",
  subTitleFontSize: "20px",
  description: "",
  descriptionColor: "#333333",
  descriptionFontSize: "16px",
  btn1Text: "",
  btn1TextColor: "#ffffff",
  btn1BgColor: "#007bff",
  btn1URL: "",
  btn2Text: "",
  btn2TextColor: "#007bff",
  btn2BgColor: "#ffffff",
  btn2URL: "",
  sliderBGType: "color",
  sliderBGColor: "#f8f9fa",
  sliderBGImg: null,
  sliderBGVideo: null,
  sliderSqquence: 1,
  isActive: true,
})

  useEffect(() => {
    fetchSlider()
  }, [params.id])

  const fetchSlider = async () => {
    try {
      const response = await fetch(`https://api.smartcorpweb.com/api/sliders/${params.id}?OrgCode=${orgCode}`)
      if (response.ok) {
        const slider = await response.json()
        setFormData({
   OrgCode: slider.OrgCode,
  aligment: slider.aligment || "center",
  title: slider.title || "",
  titleColor: slider.titleColor || "#000000",
  titleFontSize: slider.titleFontSize || "32px",
  subTitle: slider.subTitle || "",
  subTitleColor: slider.subTitleColor || "#666666",
  subTitleFontSize: slider.subTitleFontSize || "20px",
  description: slider.description || "",
  descriptionColor: slider.descriptionColor || "#333333",
  descriptionFontSize: slider.descriptionFontSize || "16px",
          btn1Text: slider.btn1Text || "",
          btn1TextColor: slider.btn1TextColor || "#ffffff",
          btn1BgColor: slider.btn1BgColor || "#007bff",
          btn1URL: slider.btn1URL || "",
          btn2Text: slider.btn2Text || "",
          btn2TextColor: slider.btn2TextColor || "#007bff",
          btn2BgColor: slider.btn2BgColor || "#ffffff",
          btn2URL: slider.btn2URL || "",
          sliderBGType: slider.sliderBGType || "color",
          sliderBGColor: slider.sliderBGColor || "#f8f9fa",
          sliderBGImg: null,
          sliderBGVideo: null,
          sliderSqquence: slider.sliderSqquence || 1,
          isActive: slider.isActive ?? true,
        })
        setCurrentImageUrl(slider.sliderBGImg || "")
        setCurrentVideoUrl(slider.sliderBGVideo || "")
      }
    } catch (error) {
      console.error("Error fetching slider:", error)
      toast({
        title: "Error",
        description: "Failed to fetch slider data",
        variant: "destructive",
      })
    } finally {
      setInitialLoading(false)
    }
  }

  const handleInputChange = (field: keyof SliderFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleFileChange = (field: "sliderBGImg" | "sliderBGVideo", file: File | null) => {
    setFormData((prev) => ({
      ...prev,
      [field]: file,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)

  try {
    const submitData = new FormData()

    // Normal fields
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "sliderBGImg" || key === "sliderBGVideo") {
        return // skip here, handled separately
      }
      if (typeof value === "boolean") {
        submitData.append(key, value ? "1" : "0")
      } else {
        submitData.append(key, String(value))
      }
    })

    // ✅ Images
    if (formData.sliderBGImg instanceof File) {
      submitData.append("sliderBGImg", formData.sliderBGImg)
    } else if (currentImageUrl) {
      submitData.append("sliderBGImg", currentImageUrl)
    }

    // ✅ Videos
    if (formData.sliderBGVideo instanceof File) {
      submitData.append("sliderBGVideo", formData.sliderBGVideo)
    } else if (currentVideoUrl) {
      submitData.append("sliderBGVideo", currentVideoUrl)
    }

    const response = await fetch(
      `https://api.smartcorpweb.com/api/sliders/${params.id}?OrgCode=${orgCode}`,
      {
        method: "PUT",
        body: submitData,
      }
    )

    if (!response.ok) throw new Error("Failed to update slider")

    toast({
      title: "Success",
      description: "Slider updated successfully",
    })
    router.push("/admin-cms/sliders")
  } catch (error) {
    console.error("Error updating slider:", error)
    toast({
      title: "Error",
      description: "Failed to update slider",
      variant: "destructive",
    })
  } finally {
    setLoading(false)
  }
}

const renderPreview = () => {
  const backgroundImage =
    formData.sliderBGImg instanceof File
      ? URL.createObjectURL(formData.sliderBGImg)
      : currentImageUrl
      ? `https://api.smartcorpweb.com${currentImageUrl}`
      : ""

  const backgroundVideo =
    formData.sliderBGVideo instanceof File
      ? URL.createObjectURL(formData.sliderBGVideo)
      : currentVideoUrl
      ? `https://api.smartcorpweb.com${currentVideoUrl}`
      : ""

  // ✅ Alignment classes
  const alignmentMap: Record<string, string> = {
    left: "text-left items-start",
    center: "text-center items-center",
    right: "text-right items-end",
  }

  return (
    <div
      className="relative min-h-96 rounded-lg overflow-hidden flex items-center justify-center"
      style={{
        backgroundColor: formData.sliderBGType === "color" ? formData.sliderBGColor : "#f8f9fa",
        backgroundImage: formData.sliderBGType === "image" && backgroundImage ? `url(${backgroundImage})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {formData.sliderBGType === "video" && backgroundVideo && (
        <video className="absolute inset-0 w-full h-full object-cover" autoPlay muted loop>
          <source src={backgroundVideo} />
        </video>
      )}

      <div
        className={`relative z-10 space-y-4 p-8 flex flex-col ${alignmentMap[formData.aligment]}`}
      >
        {formData.title && (
          <h1
            className={`${tagSizeMap[formData.titleFontSize] || "text-2xl"} font-bold`}
            style={{ color: formData.titleColor }}
          >
            {formData.title}
          </h1>
        )}

        {formData.subTitle && (
          <h2
            className={`${tagSizeMap[formData.subTitleFontSize] || "text-lg"}`}
            style={{ color: formData.subTitleColor }}
          >
            {formData.subTitle}
          </h2>
        )}

        {formData.description && (
          <p
            className={`${tagSizeMap[formData.descriptionFontSize] || "text-base"} max-w-2xl`}
            style={{ color: formData.descriptionColor }}
          >
            {formData.description}
          </p>
        )}

        <div className={`flex gap-4 pt-4 ${formData.aligment === "center" ? "justify-center" : formData.aligment === "right" ? "justify-end" : "justify-start"}`}>
          {formData.btn1Text && (
            <button
              className="px-6 py-3 rounded-lg font-medium"
              style={{
                backgroundColor: formData.btn1BgColor,
                color: formData.btn1TextColor,
              }}
            >
              {formData.btn1Text}
            </button>
          )}

          {formData.btn2Text && (
            <button
              className="px-6 py-3 rounded-lg font-medium border"
              style={{
                backgroundColor: formData.btn2BgColor,
                color: formData.btn2TextColor,
                borderColor: formData.btn2TextColor,
              }}
            >
              {formData.btn2Text}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

  if (initialLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout>
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin-cms/sliders">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sliders
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Edit Slider</h1>
          <p className="text-muted-foreground">Update slider content and settings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="buttons">Buttons</TabsTrigger>
                <TabsTrigger value="background">Background</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Content Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => handleInputChange("title", e.target.value)}
                          placeholder="Enter slider title"
                        />
                      </div>
                      <div className="space-y-2">
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

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="subTitle">Subtitle</Label>
                        <Input
                          id="subTitle"
                          value={formData.subTitle}
                          onChange={(e) => handleInputChange("subTitle", e.target.value)}
                          placeholder="Enter subtitle"
                        />
                      </div>
                      <div className="space-y-2">
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

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => handleInputChange("description", e.target.value)}
                          placeholder="Enter description"
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
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
              </TabsContent>

              <TabsContent value="buttons" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Button Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="font-medium">Button 1</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="btn1Text">Button 1 Text</Label>
                          <Input
                            id="btn1Text"
                            value={formData.btn1Text}
                            onChange={(e) => handleInputChange("btn1Text", e.target.value)}
                            placeholder="Button text"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="btn1URL">Button 1 URL</Label>
                          <Input
                            id="btn1URL"
                            value={formData.btn1URL}
                            onChange={(e) => handleInputChange("btn1URL", e.target.value)}
                            placeholder="https://example.com"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="btn1TextColor">Text Color</Label>
                          <Input
                            id="btn1TextColor"
                            type="color"
                            value={formData.btn1TextColor}
                            onChange={(e) => handleInputChange("btn1TextColor", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="btn1BgColor">Background Color</Label>
                          <Input
                            id="btn1BgColor"
                            type="color"
                            value={formData.btn1BgColor}
                            onChange={(e) => handleInputChange("btn1BgColor", e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Button 2</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="btn2Text">Button 2 Text</Label>
                          <Input
                            id="btn2Text"
                            value={formData.btn2Text}
                            onChange={(e) => handleInputChange("btn2Text", e.target.value)}
                            placeholder="Button text"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="btn2URL">Button 2 URL</Label>
                          <Input
                            id="btn2URL"
                            value={formData.btn2URL}
                            onChange={(e) => handleInputChange("btn2URL", e.target.value)}
                            placeholder="https://example.com"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="btn2TextColor">Text Color</Label>
                          <Input
                            id="btn2TextColor"
                            type="color"
                            value={formData.btn2TextColor}
                            onChange={(e) => handleInputChange("btn2TextColor", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="btn2BgColor">Background Color</Label>
                          <Input
                            id="btn2BgColor"
                            type="color"
                            value={formData.btn2BgColor}
                            onChange={(e) => handleInputChange("btn2BgColor", e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="background" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Background Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="sliderBGType">Background Type</Label>
                      <Select
                        value={formData.sliderBGType}
                        onValueChange={(value) => handleInputChange("sliderBGType", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="color">Solid Color</SelectItem>
                          <SelectItem value="image">Image</SelectItem>
                          <SelectItem value="video">Video</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.sliderBGType === "color" && (
                      <div className="space-y-2">
                        <Label htmlFor="sliderBGColor">Background Color</Label>
                        <Input
                          id="sliderBGColor"
                          type="color"
                          value={formData.sliderBGColor}
                          onChange={(e) => handleInputChange("sliderBGColor", e.target.value)}
                        />
                      </div>
                    )}

                    {formData.sliderBGType === "image" && (
                      <div className="space-y-2">
                        <Label htmlFor="sliderBGImg">Background Image</Label>
                        {currentImageUrl && (
                          <div className="text-sm text-muted-foreground mb-2">
                            Current: {currentImageUrl.split("/").pop()}
                          </div>
                        )}
                        <Input
                          id="sliderBGImg"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange("sliderBGImg", e.target.files?.[0] || null)}
                        />
                      </div>
                    )}

                    {formData.sliderBGType === "video" && (
                      <div className="space-y-2">
                        <Label htmlFor="sliderBGVideo">Background Video</Label>
                        {currentVideoUrl && (
                          <div className="text-sm text-muted-foreground mb-2">
                            Current: {currentVideoUrl.split("/").pop()}
                          </div>
                        )}
                        <Input
                          id="sliderBGVideo"
                          type="file"
                          accept="video/*"
                          onChange={(e) => handleFileChange("sliderBGVideo", e.target.files?.[0] || null)}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>General Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="sliderSqquence">Sequence Order</Label>
                      <Input
                        id="sliderSqquence"
                        type="number"
                        min="1"
                        value={formData.sliderSqquence}
                        onChange={(e) => handleInputChange("sliderSqquence", Number.parseInt(e.target.value))}
                      />
                    </div>
                    {/* Alignment */}
<div className="space-y-2">
  <Label htmlFor="aligment">Alignment</Label>
  <Select
    value={formData.aligment}
    onValueChange={(value) => handleInputChange("aligment", value)}
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
              </TabsContent>
            </Tabs>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                {loading ? "Updating..." : "Update Slider"}
              </Button>
           
            </div>
          </form>
        </div>

   
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Live Preview</CardTitle>
              </CardHeader>
              <CardContent>{renderPreview()}</CardContent>
            </Card>
          </div>
       
      </div>
    </div>
    </DashboardLayout>
  )
}
