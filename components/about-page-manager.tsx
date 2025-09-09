"use client"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { apiService, type AboutPageSection } from "@/lib/api"
import { EditAboutSectionModal } from "./edit-about-section-modal"
import { Plus, Edit, Trash2, FileText, FolderOpen } from "lucide-react"

export function AboutPageManager() {
  const [sections, setSections] = useState<AboutPageSection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingSection, setEditingSection] = useState<AboutPageSection | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    if (user?.OrgCode) {
      fetchSections()
    }
  }, [user])

  const fetchSections = async () => {
    try {
      setIsLoading(true)
      const data = await apiService.getAboutSectionsByOrg(user?.OrgCode.toString() || "")
      setSections(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch about sections",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (section: AboutPageSection) => {
    setEditingSection(section)
    setIsModalOpen(true)
  }

  const handleCreate = () => {
    setEditingSection(null)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this section?")) return

    try {
      await apiService.deleteAboutSection(id.toString())
      toast({
        title: "Success",
        description: "About section deleted successfully",
      })
      fetchSections()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete section",
        variant: "destructive",
      })
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingSection(null)
  }

  const groupedSections = sections.reduce(
    (acc, section) => {
      const sectionName = section.sectionName || "Uncategorized"
      if (!acc[sectionName]) {
        acc[sectionName] = []
      }
      acc[sectionName].push(section)
      return acc
    },
    {} as Record<string, AboutPageSection[]>,
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">About Page Manager</h1>
          <p className="text-muted-foreground">Manage your about page sections and content</p>
        </div>
        <Button onClick={handleCreate} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Add Section
        </Button>
      </div>

      <div className="space-y-6">
        {Object.keys(groupedSections).length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No About Sections</h3>
            <p className="text-muted-foreground mb-4">Get started by creating your first about page section.</p>
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Section
            </Button>
          </motion.div>
        ) : (
          Object.entries(groupedSections).map(([sectionName, sectionItems]) => (
            <motion.div
              key={sectionName}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3 pb-2 border-b border-border">
                <FolderOpen className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground capitalize">{sectionName}</h2>
                <Badge variant="secondary">{sectionItems.length} sections</Badge>
              </div>

              <div className="grid gap-4">
                <AnimatePresence>
                  {sectionItems.map((section, index) => (
                    <motion.div
                      key={section.Id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: section.secColor || "#3b82f6" }}
                              />
                              <div>
                                <CardTitle className="text-lg">{section.title}</CardTitle>
                                <CardDescription>
                                  {section.subtitle && (
                                    <span className="text-sm text-muted-foreground">{section.subtitle}</span>
                                  )}
                                </CardDescription>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleEdit(section)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(section.Id!)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        {(section.content || section.btnName) && (
                          <CardContent>
                            {section.content && (
                              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{section.content}</p>
                            )}
                            {section.btnName && (
                              <Badge
                                variant="outline"
                                style={{
                                  borderColor: section.btnColor || "#3b82f6",
                                  color: section.btnColor || "#3b82f6",
                                }}
                              >
                                {section.btnName}
                              </Badge>
                            )}
                          </CardContent>
                        )}
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <EditAboutSectionModal
        section={editingSection}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={fetchSections}
      />
    </div>
  )
}
