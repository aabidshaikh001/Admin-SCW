"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Search, Filter, FileText, Plus, Edit, Trash2, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { DashboardLayout } from "@/components/dashboard-layout"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"

interface Template {
  Id: number
  OrgCode: number
  Name: string
  Subject: string
  Body: string
  IsActive: boolean
  CreatedAt: string
  UpdatedAt: string
}

export default function TemplatesPage() {
        const { user, isLoading } = useAuth()
  const [templates, setTemplates] = useState<Template[]>([])
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [sending, setSending] = useState<number | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchTemplates()
  }, [])

  useEffect(() => {
    filterTemplates()
  }, [searchTerm, statusFilter, templates])

  const fetchTemplates = async () => {
    try {
      setLoading(true)
     const orgCode = `${user?.OrgCode}` // Replace with actual org code from auth/context // Replace with actual org code from auth/context
      const response = await fetch(`https://api.smartcorpweb.com/api/newsletter/templates/${orgCode}`)
      const data = await response.json()
      setTemplates(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch emailer",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterTemplates = () => {
    let filtered = templates

    if (searchTerm) {
      filtered = filtered.filter(
        (template) =>
          template.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          template.Subject.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "All") {
      const isActive = statusFilter === "Active"
      filtered = filtered.filter((template) => template.IsActive === isActive)
    }

    setFilteredTemplates(filtered)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this emailer?")) return

    try {
      setDeleting(id)
      // Implement delete API call
      const response = await fetch(`https://api.smartcorpweb.com/api/newsletter/template/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Template deleted successfully",
        })
        fetchTemplates()
      } else {
        throw new Error("Failed to delete")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete emailer",
        variant: "destructive",
      })
    } finally {
      setDeleting(null)
    }
  }

  const handleSendNewsletter = async (templateId: number) => {
    if (!confirm("Are you sure you want to send this newsletter to all subscribers?")) return

    try {
      setSending(templateId)
     const orgCode = `${user?.OrgCode}` // Replace with actual org code from auth/context // Replace with actual org code from auth/context

      const response = await fetch("https://api.smartcorpweb.com/api/newsletter/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          OrgCode: orgCode,
          TemplateId: templateId,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Newsletter sending process started",
        })
      } else {
        throw new Error(data.error || "Failed to send newsletter")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send newsletter",
        variant: "destructive",
      })
    } finally {
      setSending(null)
    }
  }

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
        Active
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
        Inactive
      </Badge>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
      {/* Header with Search + Filters in middle */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  className="flex flex-col sm:flex-row justify-between items-center gap-4"
>
  {/* Left: Title */}
  <h1 className="text-3xl font-bold text-foreground">Emailer</h1>

  {/* Middle: Search + Filter */}
  <div className="flex flex-col sm:flex-row gap-4 flex-1 max-w-2xl">
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
      <Input
        placeholder="Search emailers..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-10"
      />
    </div>
    <Select value={statusFilter} onValueChange={setStatusFilter}>
      <SelectTrigger className="w-full sm:w-[180px]">
        <Filter className="w-4 h-4 mr-2" />
        <SelectValue placeholder="Filter by status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="All">All Status</SelectItem>
        <SelectItem value="Active">Active</SelectItem>
        <SelectItem value="Inactive">Inactive</SelectItem>
      </SelectContent>
    </Select>
  </div>

  {/* Right: New button */}
  <Link href="/admin-nl/templates/create">
    <Button>
      <Plus className="w-4 h-4 mr-2" />
      New
    </Button>
  </Link>
</motion.div>


        {/* Filters */}
        <Card>
        
        
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="animate-pulse flex space-x-4 p-4 border rounded-lg">
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground">No emailer found</h3>
                <p className="text-sm text-muted-foreground">
                  {searchTerm || statusFilter !== "All" ? "Try adjusting your search or filters" : "No emailer yet"}
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTemplates.map((template) => (
                      <TableRow key={template.Id}>
                        <TableCell className="font-mono text-sm">#{template.Id}</TableCell>
                        <TableCell className="font-medium">{template.Name}</TableCell>
                        <TableCell className="max-w-xs truncate">{template.Subject}</TableCell>
                        <TableCell>{getStatusBadge(template.IsActive)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(template.CreatedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSendNewsletter(template.Id)}
                              disabled={sending === template.Id || !template.IsActive}
                            >
                              {sending === template.Id ? (
                                <Send className="w-4 h-4 animate-pulse" />
                              ) : (
                                <Send className="w-4 h-4" />
                              )}
                            </Button>
                            <Link href={`/admin-nl/templates/edit/${template.Id}`}>
                              <Button variant="outline" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </Link>
                            {/* <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(template.Id)}
                              disabled={deleting === template.Id}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button> */}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          
        </Card>
      </div>
    </DashboardLayout>
  )
}
