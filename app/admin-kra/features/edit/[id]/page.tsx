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

interface FeatureFormData {
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
  bgImageType?: string
  bgColor?: string
  bgImage?: string
  iconImage?: string
  Img?: string
  isActive: boolean
}

export default function EditFeaturePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user } = useAuth()
  const orgCode = user?.OrgCode

  const [formData, setFormData] = useState<FeatureFormData>({
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
    bgImageType: "icon", // Default to icon
    bgColor: "#ffffff",  // Default background color
    bgImage: "",
    iconImage: "",
    Img: "",
    isActive: true,
  })

  const [bgImageFile, setBgImageFile] = useState<File | null>(null)
  const [iconImageFile, setIconImageFile] = useState<File | null>(null)
  const [bgPreviewUrl, setBgPreviewUrl] = useState<string>("")
  const [iconPreviewUrl, setIconPreviewUrl] = useState<string>("")
  const [loading, setLoading] = useState(false)


  useEffect(() => {
    if (orgCode && params.id) fetchFeature()
  }, [orgCode, params.id])

  const fetchFeature = async () => {
    try {
      const response = await fetch(`https://api.smartcorpweb.com/api/feature/${params.id}?OrgCode=${orgCode}`)
      if (!response.ok) throw new Error("Failed to fetch feature")
      const feature: FeatureFormData = await response.json()
      setFormData({
        ...feature,
        buttonText: feature.buttonText || "",
        buttonColor: feature.buttonColor || "#007bff",
        buttonURL: feature.buttonURL || "",
        bgImageType: feature.bgImageType || "icon",
        bgColor: feature.bgColor || "#ffffff",
        bgImage: feature.bgImage || "",
        iconImage: feature.iconImage || "",
        Img: feature.Img || "",
      })
      if (feature.bgImage) setBgPreviewUrl(`https://api.smartcorpweb.com${feature.bgImage}`)
      if (feature.iconImage) setIconPreviewUrl(`https://api.smartcorpweb.com${feature.iconImage}`)
    } catch (error) {
      console.error(error)
      toast({ title: "Error", description: "Failed to fetch feature details", variant: "destructive" })
      router.push("/admin-kra/features")
    } finally {
     
    }
  }

  const handleBgFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setBgImageFile(file)
    if (file) setBgPreviewUrl(URL.createObjectURL(file))
    else if (formData.bgImage) setBgPreviewUrl(`https://api.smartcorpweb.com${formData.bgImage}`)
  }

  const handleIconFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setIconImageFile(file)
    if (file) setIconPreviewUrl(URL.createObjectURL(file))
    else if (formData.iconImage) setIconPreviewUrl(`https://api.smartcorpweb.com${formData.iconImage}`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orgCode) return
    try {
      setLoading(true)
      const form = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        if (!["bgImage", "iconImage", "Img"].includes(key)) form.append(key, value as string)
      })
      if (bgImageFile) form.append("bgImage", bgImageFile)
      if (iconImageFile) form.append("iconImage", iconImageFile)
      const response = await fetch(`https://api.smartcorpweb.com/api/feature/${params.id}?OrgCode=${orgCode}`, {
        method: "PUT",
        body: form,
      })
      if (!response.ok) throw new Error("Failed to update feature")
      toast({ title: "Success", description: "Feature updated successfully" })
      router.push("/admin-kra/features")
    } catch (error) {
      console.error(error)
      toast({ title: "Error", description: "Failed to update feature", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }



  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
         
          <div>
            <h1 className="text-2xl font-bold text-foreground">Features Management(Update)</h1>
           
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Feature Details</CardTitle>
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

                {/* Background type and color */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bgImageType">Background Type</Label>
                    <select
                      id="bgImageType"
                      value={formData.bgImageType}
                      onChange={(e) => setFormData({ ...formData, bgImageType: e.target.value })}
                      className="w-full border rounded p-2"
                    >
                      <option value="icon">Icon</option>
                      <option value="image">Image</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="bgColor">Background Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="bgColor"
                        type="color"
                        value={formData.bgColor}
                        onChange={(e) => setFormData({ ...formData, bgColor: e.target.value })}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={formData.bgColor}
                        onChange={(e) => setFormData({ ...formData, bgColor: e.target.value })}
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>
                </div>

                {/* Conditional image uploads based on bgImageType */}
                {formData.bgImageType === "image" && (
                  <div>
                    <Label htmlFor="bgImage">Background Image</Label>
                    <Input id="bgImage" type="file" accept="image/*" onChange={handleBgFileChange} />
                    {bgPreviewUrl && <img src={bgPreviewUrl} alt="BG Preview" className="w-full h-32 object-cover rounded mt-2" />}
                  </div>
                )}

                {formData.bgImageType === "icon" && (
                  <div>
                    <Label htmlFor="iconImage">Icon Image</Label>
                    <Input id="iconImage" type="file" accept="image/*" onChange={handleIconFileChange} />
                    {iconPreviewUrl && <img src={iconPreviewUrl} alt="Icon Preview" className="w-16 h-16 object-cover rounded mt-2" />}
                  </div>
                )}

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
                  <Link href="/admin-kra/features">
                    <Button variant="outline" type="button">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Live Preview
              </CardTitle>
            </CardHeader>
        <CardContent>
  <div className="border rounded-lg overflow-hidden min-h-[300px] flex flex-col">
    {formData.bgImageType === "image" && bgPreviewUrl && (
      <>
        {/* Top: Background Image */}
        <div
          className="w-full h-48 bg-cover bg-center"
          style={{ backgroundImage: `url(${bgPreviewUrl})` }}
        />

        {/* Bottom: Content */}
        <div className="w-full p-6 flex flex-col items-center" style={{ backgroundColor: formData.bgColor }}>
          <h3 className="text-2xl font-bold mb-2" style={{ color: formData.titleColor }}>
            {formData.title || "Feature Title"}
          </h3>
          <h4 className="text-lg mb-4" style={{ color: formData.subTitleColor }}>
            {formData.subTitle || "Feature Subtitle"}
          </h4>
          <p className="text-sm text-center leading-relaxed" style={{ color: formData.descriptionColor }}>
            {formData.description || "Feature description will appear here..."}
          </p>
          {formData.isButton && formData.buttonText && (
            <button
              className="px-4 py-2 rounded text-white text-sm font-medium mt-6"
              style={{ backgroundColor: formData.buttonColor }}
            >
              {formData.buttonText}
            </button>
          )}
        </div>
      </>
    )}

    {formData.bgImageType === "icon" && iconPreviewUrl && (
      <div
        className="w-full p-6 flex flex-col items-center"
        style={{ backgroundColor: formData.bgColor }}
      >
        {/* Icon at the top */}
        <img
          src={iconPreviewUrl}
          alt="Icon"
          className="w-16 h-16 object-contain mb-4"
        />

        {/* Content */}
        <h3 className="text-2xl font-bold mb-2" style={{ color: formData.titleColor }}>
          {formData.title || "Feature Title"}
        </h3>
        <h4 className="text-lg mb-4" style={{ color: formData.subTitleColor }}>
          {formData.subTitle || "Feature Subtitle"}
        </h4>
        <p className="text-sm text-center leading-relaxed" style={{ color: formData.descriptionColor }}>
          {formData.description || "Feature description will appear here..."}
        </p>
        {formData.isButton && formData.buttonText && (
          <button
            className="px-4 py-2 rounded text-white text-sm font-medium mt-6"
            style={{ backgroundColor: formData.buttonColor }}
          >
            {formData.buttonText}
          </button>
        )}
      </div>
    )}
  </div>
</CardContent>

         </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}