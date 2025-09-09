"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Save, FileText, Palette, Link } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { apiService, type HomePageSection } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface EditHomeSectionModalProps {
  section: HomePageSection | null
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export function EditHomeSectionModal({ section, isOpen, onClose, onSave }: EditHomeSectionModalProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [formData, setFormData] = useState<Partial<HomePageSection>>({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (section) {
      setFormData(section)
    } else {
      setFormData({
        OrgCode: user?.OrgCode,
        pageName: "Home",
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
    }
  }, [section, user])

  const handleSaveSection = async () => {
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
      if (section) {
        await apiService.updateHomeSection(section.id!.toString(), formData)
        toast({
          title: "Success",
          description: "Home section updated successfully",
        })
      } else {
        await apiService.createHomeSection(formData as HomePageSection)
        toast({
          title: "Success",
          description: "Home section created successfully",
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
          <DialogTitle>{section ? "Edit Home Section" : "Create Home Section"}</DialogTitle>
          <DialogDescription>Configure your home page section content and styling</DialogDescription>
        </DialogHeader>

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
              <div>
                <Label htmlFor="pageName">Page Name</Label>
                <Input
                  id="pageName"
                  value={formData.pageName || ""}
                  onChange={(e) => setFormData({ ...formData, pageName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="sectionName">Section Name *</Label>
                <Input
                  id="sectionName"
                  value={formData.sectionName || ""}
                  onChange={(e) => setFormData({ ...formData, sectionName: e.target.value })}
                  placeholder="e.g., hero, features, testimonials"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title || ""}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Section title"
                required
              />
            </div>

            <div>
              <Label htmlFor="subtitle">Subtitle</Label>
              <Input
                id="subtitle"
                value={formData.subtitle || ""}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="Section subtitle"
              />
            </div>

            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={formData.content || ""}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={4}
                placeholder="Section content..."
              />
            </div>

            <div>
              <Label htmlFor="ImgVideo">Image/Video URL</Label>
              <Input
                id="ImgVideo"
                value={formData.ImgVideo || ""}
                onChange={(e) => setFormData({ ...formData, ImgVideo: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </TabsContent>

          <TabsContent value="styling" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="iconName">Icon Name</Label>
                <Input
                  id="iconName"
                  value={formData.iconName || ""}
                  onChange={(e) => setFormData({ ...formData, iconName: e.target.value })}
                  placeholder="e.g., star, heart, check"
                />
              </div>
              <div>
                <Label htmlFor="secColor">Section Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="secColor"
                    type="color"
                    value={formData.secColor || "#3b82f6"}
                    onChange={(e) => setFormData({ ...formData, secColor: e.target.value })}
                    className="w-16 h-10 p-1 border rounded"
                  />
                  <Input
                    value={formData.secColor || "#3b82f6"}
                    onChange={(e) => setFormData({ ...formData, secColor: e.target.value })}
                    placeholder="#3b82f6"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="homeComponentName">Component Name</Label>
              <Select
                value={formData.homeComponentName || ""}
                onValueChange={(value) => setFormData({ ...formData, homeComponentName: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select component type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hero">Hero Section</SelectItem>
                  <SelectItem value="features">Features</SelectItem>
                  <SelectItem value="testimonials">Testimonials</SelectItem>
                  <SelectItem value="cta">Call to Action</SelectItem>
                  <SelectItem value="about">About</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive || false}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
          </TabsContent>

          <TabsContent value="button" className="space-y-4 mt-4">
            <div>
              <Label htmlFor="btnName">Button Text</Label>
              <Input
                id="btnName"
                value={formData.btnName || ""}
                onChange={(e) => setFormData({ ...formData, btnName: e.target.value })}
                placeholder="Learn More"
              />
            </div>

            <div>
              <Label htmlFor="btnURL">Button URL</Label>
              <Input
                id="btnURL"
                value={formData.btnURL || ""}
                onChange={(e) => setFormData({ ...formData, btnURL: e.target.value })}
                placeholder="https://example.com"
              />
            </div>

            <div>
              <Label htmlFor="btnColor">Button Color</Label>
              <div className="flex gap-2">
                <Input
                  id="btnColor"
                  type="color"
                  value={formData.btnColor || "#3b82f6"}
                  onChange={(e) => setFormData({ ...formData, btnColor: e.target.value })}
                  className="w-16 h-10 p-1 border rounded"
                />
                <Input
                  value={formData.btnColor || "#3b82f6"}
                  onChange={(e) => setFormData({ ...formData, btnColor: e.target.value })}
                  placeholder="#3b82f6"
                  className="flex-1"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 pt-4">
          <Button onClick={handleSaveSection} disabled={isLoading} className="bg-primary hover:bg-primary/90">
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Saving..." : section ? "Update" : "Create"} Section
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
