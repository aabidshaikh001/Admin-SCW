"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { FileText, Download, Trash2, Plus, Search, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface Manual {
  id: number
  AdminMannual: string | null
  UserMannual: string | null
  AdminFaqMannual: string | null
  UserFaqMannual: string | null
  createdAt: string
  updatedAt?: string
}

export default function ManualsPage() {
  const [manuals, setManuals] = useState<Manual[]>([])
  const [filteredManuals, setFilteredManuals] = useState<Manual[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingManual, setEditingManual] = useState<Manual | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchManuals()
  }, [])

  useEffect(() => {
    filterManuals()
  }, [searchTerm, manuals])

  const fetchManuals = async () => {
    try {
      setLoading(true)
      const response = await fetch("https://api.smartcorpweb.com/api/manuals")
      const data = await response.json()
      if (data.success) {
        setManuals(data.data)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch manuals",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterManuals = () => {
    let filtered = manuals

    if (searchTerm) {
      filtered = filtered.filter(
        (manual) =>
          manual.id.toString().includes(searchTerm) ||
          new Date(manual.createdAt).toLocaleDateString().includes(searchTerm),
      )
    }

    setFilteredManuals(filtered)
  }

  const handleAddManual = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    try {
      setUploading(true)
      const response = await fetch("https://api.smartcorpweb.com/api/manuals", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Success",
          description: "Manual uploaded successfully",
        })
        setIsAddDialogOpen(false)
        fetchManuals()
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload manual",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleEditManual = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!editingManual) return

    const formData = new FormData(event.currentTarget)

    try {
      setUploading(true)
      const response = await fetch(`https://api.smartcorpweb.com/api/manuals/${editingManual.id}`, {
        method: "PUT",
        body: formData,
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Success",
          description: "Manual updated successfully",
        })
        setIsEditDialogOpen(false)
        setEditingManual(null)
        fetchManuals()
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update manual",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this manual?")) return

    try {
      const response = await fetch(`https://api.smartcorpweb.com/api/manuals/${id}`, {
        method: "DELETE",
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Success",
          description: "Manual deleted successfully",
        })
        fetchManuals()
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete manual",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (manual: Manual) => {
    setEditingManual(manual)
    setIsEditDialogOpen(true)
  }

  const getFileCount = (manual: Manual) => {
    let count = 0
    if (manual.AdminMannual) count++
    if (manual.UserMannual) count++
    if (manual.AdminFaqMannual) count++
    if (manual.UserFaqMannual) count++
    return count
  }

  const hasExistingManual = manuals.length > 0

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-center gap-4"
        >
          <h1 className="text-2xl font-bold text-foreground">Help Documents</h1>
          <div className="flex flex-1 sm:flex-none items-center gap-4">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search manuals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Show Add button only if no manual exists */}
            {!hasExistingManual && (
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                   Help Documents(Add)
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Upload Manual Files</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddManual} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="AdminMannual">Admin Manual</Label>
                      <Input id="AdminMannual" name="AdminMannual" type="file" accept=".pdf,.doc,.docx" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="UserMannual">User Manual</Label>
                      <Input id="UserMannual" name="UserMannual" type="file" accept=".pdf,.doc,.docx" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="AdminFaqMannual">Admin FAQ Manual</Label>
                      <Input id="AdminFaqMannual" name="AdminFaqMannual" type="file" accept=".pdf,.doc,.docx" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="UserFaqMannual">User FAQ Manual</Label>
                      <Input id="UserFaqMannual" name="UserFaqMannual" type="file" accept=".pdf,.doc,.docx" />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={uploading}>
                        {uploading ? "Uploading..." : "Upload"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </motion.div>

        {/* Manuals Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="space-y-3 p-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="animate-pulse flex space-x-4 p-4 border rounded-lg">
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredManuals.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground">
                  {hasExistingManual ? "No manuals match your search" : "No manuals found"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {hasExistingManual 
                    ? "Try adjusting your search" 
                    : "Add your first manual to get started"
                  }
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {/* <TableHead className="w-[80px]">ID</TableHead> */}
                      <TableHead>Created Date</TableHead>
                      <TableHead>Files</TableHead>
                      <TableHead>Admin Manual</TableHead>
                      <TableHead>User Manual</TableHead>
                      <TableHead>Admin FAQ</TableHead>
                      <TableHead>User FAQ</TableHead>
                      <TableHead className="w-[120px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredManuals.map((manual) => (
                      <motion.tr
                        key={manual.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="hover:bg-muted/50"
                      >
                        {/* <TableCell className="font-mono font-medium">#{manual.id}</TableCell> */}
                        <TableCell>
                          {new Date(manual.createdAt).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{getFileCount(manual)} files</Badge>
                        </TableCell>
                        <TableCell>
                          {manual.AdminMannual ? (
                            <a
                              href={`https://api.smartcorpweb.com${manual.AdminMannual}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-primary hover:underline text-sm"
                            >
                              <Download className="w-3 h-3 mr-1" />
                              Download
                            </a>
                          ) : (
                            <span className="text-muted-foreground text-sm">No file</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {manual.UserMannual ? (
                            <a
                              href={`https://api.smartcorpweb.com${manual.UserMannual}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-primary hover:underline text-sm"
                            >
                              <Download className="w-3 h-3 mr-1" />
                              Download
                            </a>
                          ) : (
                            <span className="text-muted-foreground text-sm">No file</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {manual.AdminFaqMannual ? (
                            <a
                              href={`https://api.smartcorpweb.com${manual.AdminFaqMannual}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-primary hover:underline text-sm"
                            >
                              <Download className="w-3 h-3 mr-1" />
                              Download
                            </a>
                          ) : (
                            <span className="text-muted-foreground text-sm">No file</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {manual.UserFaqMannual ? (
                            <a
                              href={`https://api.smartcorpweb.com${manual.UserFaqMannual}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-primary hover:underline text-sm"
                            >
                              <Download className="w-3 h-3 mr-1" />
                              Download
                            </a>
                          ) : (
                            <span className="text-muted-foreground text-sm">No file</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => openEditDialog(manual)}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            {/* <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleDelete(manual.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button> */}
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Help Documents(Update)</DialogTitle>
            </DialogHeader>
            {editingManual && (
              <form onSubmit={handleEditManual} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-AdminMannual">Admin Manual</Label>
                  <Input id="edit-AdminMannual" name="AdminMannual" type="file" accept=".pdf,.doc,.docx" />
                  {editingManual.AdminMannual && (
                    <p className="text-xs text-muted-foreground">
                      Current file: {editingManual.AdminMannual.split('/').pop()}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-UserMannual">User Manual</Label>
                  <Input id="edit-UserMannual" name="UserMannual" type="file" accept=".pdf,.doc,.docx" />
                  {editingManual.UserMannual && (
                    <p className="text-xs text-muted-foreground">
                      Current file: {editingManual.UserMannual.split('/').pop()}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-AdminFaqMannual">Admin FAQ Manual</Label>
                  <Input id="edit-AdminFaqMannual" name="AdminFaqMannual" type="file" accept=".pdf,.doc,.docx" />
                  {editingManual.AdminFaqMannual && (
                    <p className="text-xs text-muted-foreground">
                      Current file: {editingManual.AdminFaqMannual.split('/').pop()}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-UserFaqMannual">User FAQ Manual</Label>
                  <Input id="edit-UserFaqMannual" name="UserFaqMannual" type="file" accept=".pdf,.doc,.docx" />
                  {editingManual.UserFaqMannual && (
                    <p className="text-xs text-muted-foreground">
                      Current file: {editingManual.UserFaqMannual.split('/').pop()}
                    </p>
                  )}
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={uploading}>
                    {uploading ? "Updating..." : "Update"}
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}