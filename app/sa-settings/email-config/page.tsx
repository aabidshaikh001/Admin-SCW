"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Mail, Pencil, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { DashboardLayout } from "@/components/dashboard-layout"

interface EmailConfig {
  vEmailType: number
  vEmailName: string
  vEmailId: string
  vSMTP: string
  vPort: number
  vPassword: string
  vHTMLTemplate: string
  vSubject: string
}

export default function EmailConfigPage() {
  const [emailConfigs, setEmailConfigs] = useState<EmailConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEmailConfig, setEditingEmailConfig] = useState<EmailConfig | null>(null)
  const [formData, setFormData] = useState({
    vEmailName: "",
    vEmailId: "",
    vSMTP: "",
    vPort: "",
    vPassword: "",
    vHTMLTemplate: "",
    vSubject: "",
  })
  const { toast } = useToast()

  const API_BASE_URL = "https://api.smartcorpweb.com/api/masterorg/email-configs"

  const fetchEmailConfigs = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE_URL}/all`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setEmailConfigs(data)
    } catch (e: any) {
      setError(e.message)
      toast({
        title: "Error",
        description: "Failed to fetch email configurations.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmailConfigs()
  }, [])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const filteredEmailConfigs = emailConfigs.filter((config) =>
    Object.values(config).some((value) => String(value).toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredEmailConfigs.slice(indexOfFirstItem, indexOfLastItem)

  const totalPages = Math.ceil(filteredEmailConfigs.length / itemsPerPage)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  const handleAddClick = () => {
    setEditingEmailConfig(null)
    setFormData({
      vEmailName: "",
      vEmailId: "",
      vSMTP: "",
      vPort: "",
      vPassword: "",
      vHTMLTemplate: "",
      vSubject: "",
    })
    setIsDialogOpen(true)
  }

  const handleEditClick = (config: EmailConfig) => {
    setEditingEmailConfig(config)
    setFormData({
      vEmailName: config.vEmailName,
      vEmailId: config.vEmailId,
      vSMTP: config.vSMTP,
      vPort: String(config.vPort),
      vPassword: config.vPassword,
      vHTMLTemplate: config.vHTMLTemplate,
      vSubject: config.vSubject,
    })
    setIsDialogOpen(true)
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setEditingEmailConfig(null)
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const payload = {
      ...formData,
      vPort: Number.parseInt(formData.vPort),
    }

    try {
      const method = editingEmailConfig ? "PUT" : "POST"
      const url = editingEmailConfig ? `${API_BASE_URL}/${editingEmailConfig.vEmailType}` : API_BASE_URL

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      toast({
        title: "Success",
        description: `Email configuration ${editingEmailConfig ? "updated" : "created"} successfully.`,
      })

      await fetchEmailConfigs()
      handleDialogClose()
    } catch (e: any) {
      setError(e.message)
      toast({
        title: "Error",
        description: `Failed to ${editingEmailConfig ? "update" : "create"} email configuration.`,
        variant: "destructive",
      })
      console.error(`Failed to ${editingEmailConfig ? "update" : "create"} email configuration:`, e)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading email configurations...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
            <CardDescription>Failed to load email configurations.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button onClick={fetchEmailConfigs} className="mt-4 w-full">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
      <DashboardLayout>
    <div className="flex flex-col gap-8 p-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 justify-between">
          
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Email Configuration Management</h1>
         
          </div>
          <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search email configurations..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-9"
              />
            </div>

            <Button onClick={handleAddClick} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Configuration
            </Button>
        </div>
      </div>

      <Card>
      
        <CardContent className="space-y-4">
          

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox checked={false} onCheckedChange={() => {}} aria-label="Select all" />
                  </TableHead>
                  <TableHead>Email Name</TableHead>
                  <TableHead>Email ID</TableHead>
                  <TableHead>SMTP Server</TableHead>
                  <TableHead>Port</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No email configurations found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentItems.map((config) => (
                    <TableRow key={config.vEmailType}>
                      <TableCell>
                        <Checkbox checked={false} onCheckedChange={() => {}} aria-label="Select row" />
                      </TableCell>
                      <TableCell className="font-medium">{config.vEmailName}</TableCell>
                      <TableCell>{config.vEmailId}</TableCell>
                      <TableCell>{config.vSMTP}</TableCell>
                      <TableCell>{config.vPort}</TableCell>
                      <TableCell>{config.vSubject}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleEditClick(config)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredEmailConfigs.length)} of{" "}
                {filteredEmailConfigs.length} entries
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => paginate(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingEmailConfig ? "Email Configuration Management(Update)" : "Email Configuration Management(New)"}</DialogTitle>
            
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-6 grid grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="vEmailName">Email Name</Label>
                <Input
                  id="vEmailName"
                  name="vEmailName"
                  type="text"
                  value={formData.vEmailName}
                  onChange={handleFormChange}
                  placeholder="e.g., Support Email"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vEmailId">Email ID</Label>
                <Input
                  id="vEmailId"
                  name="vEmailId"
                  type="email"
                  value={formData.vEmailId}
                  onChange={handleFormChange}
                  placeholder="e.g., support@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vSMTP">SMTP Server</Label>
                <Input
                  id="vSMTP"
                  name="vSMTP"
                  type="text"
                  value={formData.vSMTP}
                  onChange={handleFormChange}
                  placeholder="e.g., smtp.example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vPort">Port</Label>
                <Input
                  id="vPort"
                  name="vPort"
                  type="number"
                  value={formData.vPort}
                  onChange={handleFormChange}
                  placeholder="e.g., 587"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vPassword">Password</Label>
                <Input
                  id="vPassword"
                  name="vPassword"
                  type="password"
                  value={formData.vPassword}
                  onChange={handleFormChange}
                  placeholder="Enter password"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vSubject">Subject</Label>
                <Input
                  id="vSubject"
                  name="vSubject"
                  type="text"
                  value={formData.vSubject}
                  onChange={handleFormChange}
                  placeholder="e.g., Welcome to our service"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vHTMLTemplate">HTML Template</Label>
                <Textarea
                  id="vHTMLTemplate"
                  name="vHTMLTemplate"
                  value={formData.vHTMLTemplate}
                  onChange={handleFormChange}
                  rows={5}
                  placeholder="Enter HTML template for emails"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={handleDialogClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : editingEmailConfig ? "Save" : "Save"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
</DashboardLayout>
  )
}
