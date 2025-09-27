"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Plus, Edit, Briefcase, FolderOpen, Search } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { apiService, type CareersPageSection } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { EditCareersSectionModal } from "./edit-careers-section-modal"

export function CareersPageManager() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [sections, setSections] = useState<CareersPageSection[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSection, setSelectedSection] = useState<CareersPageSection | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [newSection, setNewSection] = useState<Partial<CareersPageSection>>({
    OrgCode: user?.OrgCode || 0,
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
    if (user?.OrgCode) {
      fetchSections()
    }
  }, [user])

  const fetchSections = async () => {
    try {
      setLoading(true)
      const data = await apiService.getCareersSectionsByOrg(user?.OrgCode.toString() || "")
      setSections(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch careers sections",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSection = async () => {
    try {
      await apiService.createOrUpdateCareersSection(newSection as CareersPageSection)
      toast({
        title: "Success",
        description: "Careers section created successfully",
      })
      setNewSection({
        OrgCode: user?.OrgCode || 0,
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
      fetchSections()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create careers section",
        variant: "destructive",
      })
    }
  }

  const handleEditSection = (section: CareersPageSection) => {
    setSelectedSection(section)
    setIsEditModalOpen(true)
  }

  const handleUpdateSection = async (updatedSection: CareersPageSection) => {
    try {
      await apiService.createOrUpdateCareersSection(updatedSection)
      toast({
        title: "Success",
        description: "Careers section updated successfully",
      })
      setIsEditModalOpen(false)
      setSelectedSection(null)
      fetchSections()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update careers section",
        variant: "destructive",
      })
    }
  }

  const filteredSections = sections.filter(
    (section) =>
      section.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.sectionName?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Group sections by sectionName
  const groupedSections = filteredSections.reduce(
    (acc, section) => {
      const sectionName = section.sectionName || "Uncategorized"
      if (!acc[sectionName]) {
        acc[sectionName] = []
      }
      acc[sectionName].push(section)
      return acc
    },
    {} as Record<string, CareersPageSection[]>,
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">Careers Page Manager</h1>
          <p className="text-muted-foreground">Manage your careers page content and job listings</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search sections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </motion.div>

      <Tabs defaultValue="manage" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manage" className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Manage Sections
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create New
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manage" className="space-y-6">
          <AnimatePresence>
            {Object.entries(groupedSections).map(([sectionName, sectionItems]) => (
              <motion.div
                key={sectionName}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 mb-4">
                  <FolderOpen className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground capitalize">
                    {sectionName} ({sectionItems.length})
                  </h3>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {sectionItems.map((section) => (
                    <motion.div key={section.Id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Card className="h-full border-border/50 hover:border-primary/50 transition-colors">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1 flex-1">
                              <CardTitle className="text-lg text-foreground line-clamp-2">{section.title}</CardTitle>
                              {section.subtitle && (
                                <CardDescription className="line-clamp-2">{section.subtitle}</CardDescription>
                              )}
                            </div>
                            <Badge variant={section.isActive ? "default" : "secondary"}>
                              {section.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-3">
                            {section.content && (
                              <p className="text-sm text-muted-foreground line-clamp-3">{section.content}</p>
                            )}

                            <div className="flex items-center justify-between pt-2">
                              <div className="flex items-center gap-2">
                                {section.iconName && <div className="w-4 h-4 bg-primary/10 rounded" />}
                                {section.secColor && (
                                  <div
                                    className="w-4 h-4 rounded border"
                                    style={{ backgroundColor: section.secColor }}
                                  />
                                )}
                              </div>

                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditSection(section)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
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
          </AnimatePresence>

          {filteredSections.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
              <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No careers sections found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm
                  ? "No sections match your search criteria."
                  : "Get started by creating your first careers section."}
              </p>
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle>Create New Careers Section</CardTitle>
                <CardDescription>
                  Add a new section to your careers page with job listings and career information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="content" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="content">Content</TabsTrigger>
                    <TabsTrigger value="styling">Styling</TabsTrigger>
                    <TabsTrigger value="button">Button</TabsTrigger>
                  </TabsList>

                  <TabsContent value="content" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="sectionName">Section Name</Label>
                        <Input
                          id="sectionName"
                          placeholder="e.g., job-listings, career-benefits"
                          value={newSection.sectionName}
                          onChange={(e) => setNewSection({ ...newSection, sectionName: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          placeholder="Section title"
                          value={newSection.title}
                          onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subtitle">Subtitle</Label>
                      <Input
                        id="subtitle"
                        placeholder="Section subtitle (optional)"
                        value={newSection.subtitle}
                        onChange={(e) => setNewSection({ ...newSection, subtitle: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="content">Content</Label>
                      <Textarea
                        id="content"
                        placeholder="Section content and description"
                        value={newSection.content}
                        onChange={(e) => setNewSection({ ...newSection, content: e.target.value })}
                        rows={4}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="imgVideo">Image/Video URL</Label>
                      <Input
                        id="imgVideo"
                        placeholder="https://example.com/image.jpg"
                        value={newSection.ImgVideo}
                        onChange={(e) => setNewSection({ ...newSection, ImgVideo: e.target.value })}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="styling" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="iconName">Icon Name</Label>
                        <Input
                          id="iconName"
                          placeholder="e.g., briefcase, users, star"
                          value={newSection.iconName}
                          onChange={(e) => setNewSection({ ...newSection, iconName: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="secColor">Section Color</Label>
                        <div className="flex gap-2">
                          <Input
                            id="secColor"
                            type="color"
                            value={newSection.secColor}
                            onChange={(e) => setNewSection({ ...newSection, secColor: e.target.value })}
                            className="w-16 h-10 p-1 border rounded"
                          />
                          <Input
                            placeholder="#3b82f6"
                            value={newSection.secColor}
                            onChange={(e) => setNewSection({ ...newSection, secColor: e.target.value })}
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="button" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="btnName">Button Text</Label>
                        <Input
                          id="btnName"
                          placeholder="e.g., Apply Now, View Jobs"
                          value={newSection.btnName}
                          onChange={(e) => setNewSection({ ...newSection, btnName: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="btnURL">Button URL</Label>
                        <Input
                          id="btnURL"
                          placeholder="https://example.com/careers"
                          value={newSection.btnURL}
                          onChange={(e) => setNewSection({ ...newSection, btnURL: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="btnColor">Button Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="btnColor"
                          type="color"
                          value={newSection.btnColor}
                          onChange={(e) => setNewSection({ ...newSection, btnColor: e.target.value })}
                          className="w-16 h-10 p-1 border rounded"
                        />
                        <Input
                          placeholder="#3b82f6"
                          value={newSection.btnColor}
                          onChange={(e) => setNewSection({ ...newSection, btnColor: e.target.value })}
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isActive"
                        checked={newSection.isActive}
                        onCheckedChange={(checked) => setNewSection({ ...newSection, isActive: checked })}
                      />
                      <Label htmlFor="isActive">Active Section</Label>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex justify-end pt-6">
                  <Button onClick={handleCreateSection} className="min-w-32">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Section
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>

      <EditCareersSectionModal
        section={selectedSection}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedSection(null)
        }}
        onUpdate={handleUpdateSection}
      />
    </div>
  )
}
