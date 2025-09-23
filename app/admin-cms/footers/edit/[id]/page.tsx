"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Eye, Loader2 } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"

interface FooterFormData {
  OrgCode: number
  colId: number
  colType: string
  name: string
  description: string
  URL: string
  isActive: boolean
}

interface EditFooterPageProps {
  params: {
    id: string
  }
}

export default function EditFooterPage({ params }: EditFooterPageProps) {
      const { user } = useAuth()
      const orgCode = user?.OrgCode || 1
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [showPreview, setShowPreview] = useState(false)
  const [formData, setFormData] = useState<FooterFormData>({
    OrgCode: orgCode,
    colId: 0,
    colType: "",
    name: "",
    description: "",
    URL: "",
    isActive: true,
  })

  useEffect(() => {
    fetchFooter()
  }, [params.id])

  const fetchFooter = async () => {
    try {
      setInitialLoading(true)
      const response = await fetch(`https://api.smartcorpweb.com/api/footers/${params.id}?OrgCode=${orgCode}`)
      if (response.ok) {
        const footer = await response.json()
        setFormData({
          OrgCode: footer.OrgCode || 1,
          colId: footer.colId || 0,
          colType: footer.colType || "",
          name: footer.name || "",
          description: footer.description || "",
          URL: footer.URL || "",
          isActive: footer.isActive ?? true,
        })
      }
    } catch (error) {
      console.error("Error fetching footer:", error)
    } finally {
      setInitialLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`https://api.smartcorpweb.com/api/footers/${params.id}?OrgCode=${orgCode}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push("/admin-cms/footers")
      } else {
        console.error("Failed to update footer")
      }
    } catch (error) {
      console.error("Error updating footer:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof FooterFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const footerTypes = ["info", "links", "others"]

  if (initialLoading) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout>
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" asChild>
          <Link href="/admin-cms/footers">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Footers
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-balance">Edit Footer Item</h1>
          <p className="text-muted-foreground">Update footer section or link</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Footer Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="colId">Column ID</Label>
                  <Input
                    id="colId"
                    type="number"
                    value={formData.colId}
                    onChange={(e) => handleInputChange("colId", Number.parseInt(e.target.value) || 1)}
                    min="1"
                    max="4"
                    required
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">Footer column (1-4)</p>
                </div>
                <div className="space-y-2">
                <Label htmlFor="colType">Type</Label>
                <Select
                  value={formData.colType}
                  onValueChange={(value) => {
                    handleInputChange("colType", value);
              
                    // Automatically set colId based on type
                    if (value === "links") {
                      handleInputChange("colId", 1);
                    } else if (value === "others") {
                      handleInputChange("colId", 2);
                    } else if (value === "info") {
                      handleInputChange("colId", 0);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {footerTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!formData.colType && (
                  <p className="text-red-500 text-sm mt-1">Type is required</p>
                )}
              </div>
              
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Footer item name"
                
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Brief description of the footer item"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="URL">URL</Label>
                <Input
                  id="URL"
                  type="url"
                  value={formData.URL}
                  onChange={(e) => handleInputChange("URL", e.target.value)}
                  placeholder="https://example.com"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleInputChange("isActive", checked)}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? "Updating..." : "Update Footer Item"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowPreview(!showPreview)}>
                  <Eye className="w-4 h-4 mr-2" />
                  {showPreview ? "Hide" : "Show"} Preview
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {showPreview && (
          <Card>
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Column {formData.colId}</span>
                    {formData.colType && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{formData.colType}</span>
                    )}
                  </div>

                  {formData.name && <h3 className="font-semibold text-lg">{formData.name}</h3>}

                  {formData.description && <p className="text-sm text-muted-foreground">{formData.description}</p>}

                  {formData.URL && (
                    <a
                      href={formData.URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm underline"
                    >
                      {formData.URL}
                    </a>
                  )}

                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className={`px-2 py-1 rounded ${formData.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                    >
                      {formData.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
    </DashboardLayout>
  )
}
