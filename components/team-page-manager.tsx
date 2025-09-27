"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { apiService, type TeamPageSection } from "@/lib/api"
import { Plus, Edit, Trash2, Users, FolderOpen, Search, Loader2 } from "lucide-react"

export default function TeamPageManager() {
  const { user } = useAuth()
  const [sections, setSections] = useState<TeamPageSection[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSection, setSelectedSection] = useState<string>("all")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingSection, setEditingSection] = useState<TeamPageSection | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const [formData, setFormData] = useState<Partial<TeamPageSection>>({
    pageName: "Team",
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
    if (user?.OrgCode) {
      fetchSections()
    }
  }, [user])

  const fetchSections = async () => {
    try {
      setLoading(true)
      // This should call the correct API endpoint for team page sections
      // You need to create this endpoint in your backend
      const data = await apiService.getTeamSectionsByOrg(user?.OrgCode.toString() || "")
      setSections(data)
    } catch (error) {
      console.error("Error fetching team sections:", error)
      toast({
        title: "Error",
        description: "Failed to fetch team sections",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.OrgCode) return

    try {
      const sectionData = {
        ...formData,
        OrgCode: user.OrgCode,
      } as TeamPageSection

      await apiService.createTeamSection(sectionData)

      toast({
        title: "Success",
        description: "Team section created successfully",
      })

      setIsCreateModalOpen(false)
      resetForm()
      fetchSections()
    } catch (error) {
      console.error("Error creating team section:", error)
      toast({
        title: "Error",
        description: "Failed to create team section",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (section: TeamPageSection) => {
    setEditingSection(section)
    setFormData(section)
    setIsEditModalOpen(true)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingSection?.id) return

    try {
      await apiService.updateTeamSection(editingSection.id.toString(), formData)

      toast({
        title: "Success",
        description: "Team section updated successfully",
      })

      setIsEditModalOpen(false)
      setEditingSection(null)
      resetForm()
      fetchSections()
    } catch (error) {
      console.error("Error updating team section:", error)
      toast({
        title: "Error",
        description: "Failed to update team section",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this team section?")) return

    try {
      await apiService.deleteTeamSection(id.toString())

      toast({
        title: "Success",
        description: "Team section deleted successfully",
      })

      fetchSections()
    } catch (error) {
      console.error("Error deleting team section:", error)
      toast({
        title: "Error",
        description: "Failed to delete team section",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      pageName: "Team",
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

  const filteredSections = sections.filter((section) => {
    const matchesSearch =
      section.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.sectionName?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSection = selectedSection === "all" || section.sectionName === selectedSection
    return matchesSearch && matchesSection
  })

  const uniqueSections = [...new Set(sections.map((s) => s.sectionName))].filter(Boolean)

  const groupedSections = uniqueSections.reduce(
    (acc, sectionName) => {
      acc[sectionName] = filteredSections.filter((s) => s.sectionName === sectionName)
      return acc
    },
    {} as Record<string, TeamPageSection[]>,
  )

  const renderForm = (onSubmit: (e: React.FormEvent) => void, submitText: string) => (
    <form onSubmit={onSubmit} className="space-y-6">
      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="styling">Styling</TabsTrigger>
          <TabsTrigger value="button">Button</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sectionName">Section Name</Label>
              <Input
                id="sectionName"
                value={formData.sectionName || ""}
                onChange={(e) => setFormData({ ...formData, sectionName: e.target.value })}
                placeholder="e.g., Leadership, Developers"
                required
              />
            </div>
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title || ""}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Section title"
                required
              />
            </div>
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
              placeholder="Section content"
              rows={4}
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

        <TabsContent value="styling" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="iconName">Icon Name</Label>
              <Input
                id="iconName"
                value={formData.iconName || ""}
                onChange={(e) => setFormData({ ...formData, iconName: e.target.value })}
                placeholder="e.g., users, star, heart"
              />
            </div>
            <div>
              <Label htmlFor="secColor">Section Color</Label>
              <Input
                id="secColor"
                type="color"
                value={formData.secColor || "#3b82f6"}
                onChange={(e) => setFormData({ ...formData, secColor: e.target.value })}
              />
            </div>
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

        <TabsContent value="button" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="btnName">Button Text</Label>
              <Input
                id="btnName"
                value={formData.btnName || ""}
                onChange={(e) => setFormData({ ...formData, btnName: e.target.value })}
                placeholder="e.g., Learn More, Contact"
              />
            </div>
            <div>
              <Label htmlFor="btnColor">Button Color</Label>
              <Input
                id="btnColor"
                type="color"
                value={formData.btnColor || "#3b82f6"}
                onChange={(e) => setFormData({ ...formData, btnColor: e.target.value })}
              />
            </div>
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
        </TabsContent>
      </Tabs>

      <Button type="submit" className="w-full">
        {submitText}
      </Button>
    </form>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Team Page Manager</h1>
          <p className="text-muted-foreground">Manage your team page sections and content</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Section
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Team Section</DialogTitle>
              <DialogDescription>Add a new section to your team page</DialogDescription>
            </DialogHeader>
            {renderForm(handleSubmit, "Create Section")}
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search sections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedSection} onValueChange={setSelectedSection}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by section" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sections</SelectItem>
            {uniqueSections.map((section) => (
              <SelectItem key={section} value={section}>
                {section}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <AnimatePresence>
        {Object.keys(groupedSections).length > 0 ? (
          <div className="space-y-6">
            {Object.entries(groupedSections).map(([sectionName, sectionItems]) => (
              <motion.div
                key={sectionName}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">{sectionName}</h2>
                  <Badge variant="secondary">{sectionItems.length}</Badge>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {sectionItems.map((section) => (
                    <motion.div
                      key={section.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      whileHover={{ y: -2 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className="h-full">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <CardTitle className="text-lg">{section.title}</CardTitle>
                              {section.subtitle && <CardDescription>{section.subtitle}</CardDescription>}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={section.isActive ? "default" : "secondary"}>
                                {section.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {section.content && (
                              <p className="text-sm text-muted-foreground line-clamp-3">{section.content}</p>
                            )}

                            <div className="flex items-center justify-between pt-2">
                              <div className="flex items-center gap-2">
                                {section.iconName && (
                                  <div className="w-4 h-4 rounded" style={{ backgroundColor: section.secColor }} />
                                )}
                                <span className="text-xs text-muted-foreground">{section.iconName || "No icon"}</span>
                              </div>

                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="sm" onClick={() => handleEdit(section)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                {/* <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => section.id && handleDelete(section.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button> */}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No team sections found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || selectedSection !== "all"
                ? "No sections match your current filters"
                : "Get started by creating your first team section"}
            </p>
            {!searchTerm && selectedSection === "all" && (
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Section
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Team Section</DialogTitle>
            <DialogDescription>Update the team section details</DialogDescription>
          </DialogHeader>
          {renderForm(handleUpdate, "Update Section")}
        </DialogContent>
      </Dialog>
    </div>
  )
}