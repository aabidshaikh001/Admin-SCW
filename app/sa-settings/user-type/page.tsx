"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Pencil, Plus, Search, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DashboardLayout } from "@/components/dashboard-layout"
interface UserType {
  UserTypeId: number
  OrgCode: number
  OrgName: string
  UserTypeName: string
  Status: string
}

export default function UserTypePage() {
  const [userTypes, setUserTypes] = useState<UserType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUserType, setEditingUserType] = useState<UserType | null>(null)
  const [formData, setFormData] = useState({
    OrgCode: "",
    OrgName: "",
    UserTypeName: "",
    Status: "Active",
  })
  const { toast } = useToast()

  const API_BASE_URL = "https://api.smartcorpweb.com/api/masterorg/user-types"

  const fetchUserTypes = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/all`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setUserTypes(data)
    } catch (e: any) {
      toast({
        title: "Error",
        description: "Failed to fetch user types.",
        variant: "destructive",
      })
      console.error("Failed to fetch user types:", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserTypes()
  }, [])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const filteredUserTypes = userTypes.filter((userType) =>
    Object.values(userType).some((value) => String(value).toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredUserTypes.slice(indexOfFirstItem, indexOfLastItem)

  const totalPages = Math.ceil(filteredUserTypes.length / itemsPerPage)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  const handleAddClick = () => {
    setEditingUserType(null)
    setFormData({
      OrgCode: "",
      OrgName: "",
      UserTypeName: "",
      Status: "Active",
    })
    setDialogOpen(true)
  }

  const handleEditClick = (userType: UserType) => {
    setEditingUserType(userType)
    setFormData({
      OrgCode: String(userType.OrgCode),
      OrgName: userType.OrgName,
      UserTypeName: userType.UserTypeName,
      Status: userType.Status,
    })
    setDialogOpen(true)
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
    setEditingUserType(null)
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const payload = {
      ...formData,
      OrgCode: Number.parseInt(formData.OrgCode),
      TransBy: "Admin", // Assuming a default user for now
      TranByUpdate: "Admin", // Assuming a default user for now
    }

    try {
      const method = editingUserType ? "PUT" : "POST"
      const url = editingUserType ? `${API_BASE_URL}/${editingUserType.UserTypeId}` : API_BASE_URL

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
        description: `User type ${editingUserType ? "updated" : "created"} successfully.`,
      })

      await fetchUserTypes()
      handleDialogClose()
    } catch (e: any) {
      toast({
        title: "Error",
        description: `Failed to ${editingUserType ? "update" : "create"} user type.`,
        variant: "destructive",
      })
      console.error(`Failed to ${editingUserType ? "update" : "create"} user type:`, e)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading user types...</p>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout>
    <div className="flex flex-col gap-8 p-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 justify-between">
          
          <div>
            <h1 className="text-2xl font-bold tracking-tight">User Type Management</h1>
          
          </div>
          <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search user types..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-9"
              />
            </div>
           <Button onClick={handleAddClick} className="gap-2">
              <Plus className="h-4 w-4" />
              New
            </Button>
        </div>
      </div>

      <Card>
        
        <CardContent className="space-y-4">
         

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                 
                  <TableHead>Organization</TableHead>
                  <TableHead>User Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No user types found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentItems.map((userType) => (
                    <TableRow key={userType.UserTypeId}>
                      
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{userType.OrgName}</span>
                          <span className="text-sm text-muted-foreground">Code: {userType.OrgCode}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{userType.UserTypeName}</TableCell>
                      <TableCell>
                        <Badge variant={userType.Status === "Active" ? "default" : "secondary"}>
                          {userType.Status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleEditClick(userType)}>
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
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredUserTypes.length)} of{" "}
                {filteredUserTypes.length} entries
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingUserType ? "User Type Management(Update)" : "User Type Management(New)"}</DialogTitle>
           
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="OrgCode">Organization Code</Label>
                <Input
                  id="OrgCode"
                  name="OrgCode"
                  type="number"
                  value={formData.OrgCode}
                  onChange={handleFormChange}
                  placeholder="Enter organization code"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="OrgName">Organization Name</Label>
                <Input
                  id="OrgName"
                  name="OrgName"
                  value={formData.OrgName}
                  onChange={handleFormChange}
                  placeholder="Enter organization name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="UserTypeName">User Type Name</Label>
                <Input
                  id="UserTypeName"
                  name="UserTypeName"
                  value={formData.UserTypeName}
                  onChange={handleFormChange}
                  placeholder="Enter user type name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="Status">Status</Label>
                <Select
                  value={formData.Status}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, Status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={handleDialogClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : editingUserType ? "Save" : "Save"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
</DashboardLayout>
  )
}
