"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { apiService, type AboutPageSection } from "@/lib/api"
import { Save, FileText, Palette, Link } from "lucide-react"

interface EditAboutSectionModalProps {
  section: AboutPageSection | null
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export function EditAboutSectionModal({ section, isOpen, onClose, onSave }: EditAboutSectionModalProps) {
  const [formData, setFormData] = useState<Partial<AboutPageSection>>({})
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    if (section) {
      setFormData(section)
    } else {
      setFormData({
        pageName: "About",
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
      })
    }
  }, [section])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.sectionName || !formData.title) {
      toast({
        title: "Error",
        description: "Section name and title are required",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      const sectionData = {
        ...formData,
        OrgCode: user?.OrgCode || 0,
      } as AboutPageSection

      if (section) {
        await apiService.updateAboutSection(section.Id!.toString(), sectionData)
        toast({
          title: "Success",
          description: "About section updated successfully",
        })
      } else {
        await apiService.createAboutSection(sectionData)
        toast({
          title: "Success",
          description: "About section created successfully",
        })
      }

      onSave()
      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save section",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{section ? "Edit About Section" : "Create New About Section"}</DialogTitle>
          <DialogDescription>
            {section ? "Update the about section details" : "Add a new section to your about page"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="content" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Content
              </TabsTrigger>
              <TabsTrigger value="styling" className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Styling
              </TabsTrigger>
              <TabsTrigger value="button" className="flex items-center gap-2">
                <Link className="w-4 h-4" />
                Button
              </TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sectionName">Section Name *</Label>
                  <Input
                    id="sectionName"
                    value={formData.sectionName}
                    onChange={(e) => setFormData({ ...formData, sectionName: e.target.value })}
                    placeholder="e.g., hero, mission, team"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Section title"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input
                  id="subtitle"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="Section subtitle"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Section content..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ImgVideo">Image/Video URL</Label>
                <Input
                  id="ImgVideo"
                  value={formData.ImgVideo}
                  onChange={(e) => setFormData({ ...formData, ImgVideo: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </TabsContent>

            <TabsContent value="styling" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="iconName">Icon Name</Label>
                  <Input
                    id="iconName"
                    value={formData.iconName}
                    onChange={(e) => setFormData({ ...formData, iconName: e.target.value })}
                    placeholder="e.g., star, heart, check"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secColor">Section Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secColor"
                      type="color"
                      value={formData.secColor}
                      onChange={(e) => setFormData({ ...formData, secColor: e.target.value })}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      value={formData.secColor}
                      onChange={(e) => setFormData({ ...formData, secColor: e.target.value })}
                      placeholder="#3b82f6"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="button" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="btnName">Button Text</Label>
                  <Input
                    id="btnName"
                    value={formData.btnName}
                    onChange={(e) => setFormData({ ...formData, btnName: e.target.value })}
                    placeholder="Learn More"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="btnURL">Button URL</Label>
                  <Input
                    id="btnURL"
                    value={formData.btnURL}
                    onChange={(e) => setFormData({ ...formData, btnURL: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="btnColor">Button Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="btnColor"
                    type="color"
                    value={formData.btnColor}
                    onChange={(e) => setFormData({ ...formData, btnColor: e.target.value })}
                    className="w-16 h-10 p-1 border rounded"
                  />
                  <Input
                    value={formData.btnColor}
                    onChange={(e) => setFormData({ ...formData, btnColor: e.target.value })}
                    placeholder="#3b82f6"
                    className="flex-1"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90">
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? "Saving..." : section ? "Update Section" : "Create Section"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
import { motion } from "framer-motion"