"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Save, X } from "lucide-react"
import type { CareersPageSection } from "@/lib/api"

interface EditCareersSectionModalProps {
  section: CareersPageSection | null
  isOpen: boolean
  onClose: () => void
  onUpdate: (section: CareersPageSection) => void
}

export function EditCareersSectionModal({ section, isOpen, onClose, onUpdate }: EditCareersSectionModalProps) {
  const [formData, setFormData] = useState<CareersPageSection>({
    Id: 0,
    OrgCode: 0,
    pageName: "careers",
    sectionName: "",
    title: "",
    subtitle: "",
    content: "",
    iconName: "",
    secColor: "#3b82f6",
    ImgVideo: "",
    btnName: "",
    btnColor: "#3b82f6",
    btnURL: "",
    isActive: true,
  })

  useEffect(() => {
    if (section) {
      setFormData(section)
    }
  }, [section])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdate(formData)
  }

  const handleInputChange = (field: keyof CareersPageSection, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">Edit Careers Section</DialogTitle>
          <DialogDescription>Update the careers section content and settings</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="content" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="styling">Styling</TabsTrigger>
              <TabsTrigger value="button">Button</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-sectionName">Section Name</Label>
                  <Input
                    id="edit-sectionName"
                    value={formData.sectionName}
                    onChange={(e) => handleInputChange("sectionName", e.target.value)}
                    placeholder="e.g., job-listings, career-benefits"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Title</Label>
                  <Input
                    id="edit-title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Section title"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-subtitle">Subtitle</Label>
                <Input
                  id="edit-subtitle"
                  value={formData.subtitle || ""}
                  onChange={(e) => handleInputChange("subtitle", e.target.value)}
                  placeholder="Section subtitle (optional)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-content">Content</Label>
                <Textarea
                  id="edit-content"
                  value={formData.content || ""}
                  onChange={(e) => handleInputChange("content", e.target.value)}
                  placeholder="Section content and description"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-imgVideo">Image/Video URL</Label>
                <Input
                  id="edit-imgVideo"
                  value={formData.ImgVideo || ""}
                  onChange={(e) => handleInputChange("ImgVideo", e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </TabsContent>

            <TabsContent value="styling" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-iconName">Icon Name</Label>
                  <Input
                    id="edit-iconName"
                    value={formData.iconName || ""}
                    onChange={(e) => handleInputChange("iconName", e.target.value)}
                    placeholder="e.g., briefcase, users, star"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-secColor">Section Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="edit-secColor"
                      type="color"
                      value={formData.secColor || "#3b82f6"}
                      onChange={(e) => handleInputChange("secColor", e.target.value)}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      value={formData.secColor || "#3b82f6"}
                      onChange={(e) => handleInputChange("secColor", e.target.value)}
                      placeholder="#3b82f6"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="button" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-btnName">Button Text</Label>
                  <Input
                    id="edit-btnName"
                    value={formData.btnName || ""}
                    onChange={(e) => handleInputChange("btnName", e.target.value)}
                    placeholder="e.g., Apply Now, View Jobs"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-btnURL">Button URL</Label>
                  <Input
                    id="edit-btnURL"
                    value={formData.btnURL || ""}
                    onChange={(e) => handleInputChange("btnURL", e.target.value)}
                    placeholder="https://example.com/careers"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-btnColor">Button Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="edit-btnColor"
                    type="color"
                    value={formData.btnColor || "#3b82f6"}
                    onChange={(e) => handleInputChange("btnColor", e.target.value)}
                    className="w-16 h-10 p-1 border rounded"
                  />
                  <Input
                    value={formData.btnColor || "#3b82f6"}
                    onChange={(e) => handleInputChange("btnColor", e.target.value)}
                    placeholder="#3b82f6"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-isActive"
                  checked={formData.isActive || false}
                  onCheckedChange={(checked) => handleInputChange("isActive", checked)}
                />
                <Label htmlFor="edit-isActive">Active Section</Label>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit">
              <Save className="w-4 h-4 mr-2" />
              Update Section
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
