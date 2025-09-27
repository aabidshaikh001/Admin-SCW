"use client"

import { useState } from "react"
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

export default function CreateFeaturePage() {
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
    isActive: true,
  })

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [loading, setLoading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setPreviewUrl(URL.createObjectURL(file)) // instant preview
    } else {
      setImageFile(null)
      setPreviewUrl("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  if (!orgCode) return

  try {
    setLoading(true)
    const fd = new FormData()
    fd.append("OrgCode", orgCode.toString())
    Object.entries(formData).forEach(([key, value]) => {
      fd.append(key, value.toString())
    })
    if (imageFile) fd.append("Img", imageFile)

    const response = await fetch("https://api.smartcorpweb.com/api/services", {
      method: "POST",
      body: fd,
    })

    if (response.ok) {
      const data = await response.json()
      const imagePath = data.Img || data.path

      if (imagePath) {
        setPreviewUrl(`https://api.smartcorpweb.com${imagePath}`) // ✅ backend preview
      }

      toast({
        title: "Success",
        description: "Services created successfully",
      })

      // optional: wait 1s before navigating so user sees uploaded preview
      setTimeout(() => {
        router.push("/admin-kra/services")
      }, 1000)
    } else {
      throw new Error("Failed to create Services")
    }
  } catch (error) {
    console.error("Error creating Services:", error)
    toast({
      title: "Error",
      description: "Failed to create Services",
      variant: "destructive",
    })
  } finally {
    setLoading(false)
  }
}

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
      
          <div>
            <h1 className="text-2xl font-bold text-foreground">Services Management(New)</h1>
          
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Services Details</CardTitle>
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
                  {previewUrl && (
                    <img
                      src={previewUrl}
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
                  <Link href="/admin-kra/services">
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
    <div className="border rounded-lg p-6 bg-background text-center">
      {/* Icon Preview (small, top aligned) */}
      {previewUrl && (
        <img
          src={previewUrl}
          alt="Services Icon"
          className="w-12 h-12 mx-auto mb-3 object-contain"
        />
      )}

      {/* Title */}
      <h3
        className="text-lg font-bold mb-2"
        style={{ color: formData.titleColor }}
      >
        {formData.title || "Services Title"}
      </h3>

      {/* Subtitle (optional, smaller text) */}
      {formData.subTitle && (
        <h4
          className="text-sm font-semibold mb-2"
          style={{ color: formData.subTitleColor }}
        >
          {formData.subTitle}
        </h4>
      )}

      {/* Description */}
      <p
        className="text-sm mb-4"
        style={{ color: formData.descriptionColor }}
      >
        {formData.description || "Services description will appear here..."}
      </p>

      {/* Button */}
      {formData.isButton && formData.buttonText && (
        <button
          className="px-4 py-2 rounded text-white text-sm font-medium"
          style={{ backgroundColor: formData.buttonColor }}
        >
          {formData.buttonText}
        </button>
      )}
    </div>
  </CardContent>
</Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
