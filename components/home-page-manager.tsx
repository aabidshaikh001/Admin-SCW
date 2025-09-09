"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Home, Palette, FolderOpen } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { apiService, type HomePageSection } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { EditHomeSectionModal } from "./edit-home-section-modal"

export function HomePageManager() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [sections, setSections] = useState<HomePageSection[]>([])
  const [loading, setLoading] = useState(true)
  const [editingSection, setEditingSection] = useState<HomePageSection | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    if (user?.OrgCode) {
      fetchHomeSections()
    }
  }, [user])

  const fetchHomeSections = async () => {
    try {
      setLoading(true)
      const data = await apiService.getHomeSectionsByOrg(user?.OrgCode.toString() || "")
      setSections(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch home sections",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSection = () => {
    setEditingSection(null)
    setIsModalOpen(true)
  }

  const handleEditSection = (section: HomePageSection) => {
    setEditingSection(section)
    setIsModalOpen(true)
  }

  const handleDeleteSection = async (id: number) => {
    if (confirm("Are you sure you want to delete this section?")) {
      try {
        await apiService.deleteHomeSection(id.toString())
        toast({
          title: "Success",
          description: "Home section deleted successfully",
        })
        fetchHomeSections()
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete section",
          variant: "destructive",
        })
      }
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
    {} as Record<string, HomePageSection[]>,
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Home Page Manager</h1>
          <p className="text-muted-foreground">Manage your website's home page sections and content</p>
        </div>
        <Button onClick={handleCreateSection} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Section
        </Button>
      </div>

      <div className="space-y-6">
        {Object.keys(groupedSections).length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <Home className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No home sections found</h3>
            <p className="text-muted-foreground mb-4">Create your first home page section to get started</p>
            <Button onClick={handleCreateSection}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Section
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

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence>
                  {sectionItems.map((section, index) => (
                    <motion.div
                      key={section.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{section.title || section.sectionName}</CardTitle>
                            <Badge variant={section.isActive ? "default" : "secondary"}>
                              {section.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <CardDescription>{section.subtitle}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Home className="h-4 w-4" />
                              <span>{section.pageName}</span>
                            </div>
                            {section.secColor && (
                              <div className="flex items-center gap-2">
                                <Palette className="h-4 w-4" />
                                <div className="w-4 h-4 rounded border" style={{ backgroundColor: section.secColor }} />
                                <span>{section.secColor}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2 mt-4">
                            <Button variant="outline" size="sm" onClick={() => handleEditSection(section)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDeleteSection(section.id!)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <EditHomeSectionModal
        section={editingSection}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={fetchHomeSections}
      />
    </motion.div>
  )
}
