"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Pencil, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DashboardLayout } from "@/components/dashboard-layout"

interface OrgType {
  OrgTypeId: number
  OrganisationType: string
  Status: string
}

export default function OrgTypePage() {
  const [orgTypes, setOrgTypes] = useState<OrgType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingOrgType, setEditingOrgType] = useState<OrgType | null>(null)
  const [formData, setFormData] = useState({
    OrganisationType: "",
    Status: "Active",
  })
  const { toast } = useToast()

  const API_BASE_URL = "https://api.smartcorpweb.com/api/masterorg/org-types"

  const fetchOrgTypes = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/all`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setOrgTypes(data)
    } catch (e: any) {
      toast({
        title: "Error",
        description: "Failed to fetch organisation types.",
        variant: "destructive",
      })
      console.error("Failed to fetch organisation types:", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrgTypes()
  }, [])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const filteredOrgTypes = orgTypes.filter((orgType) =>
    Object.values(orgType).some((value) => String(value).toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredOrgTypes.slice(indexOfFirstItem, indexOfLastItem)

  const totalPages = Math.ceil(filteredOrgTypes.length / itemsPerPage)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  const handleAddClick = () => {
    setEditingOrgType(null)
    setFormData({
      OrganisationType: "",
      Status: "Active",
    })
    setDialogOpen(true)
  }

  const handleEditClick = (orgType: OrgType) => {
    setEditingOrgType(orgType)
    setFormData({
      OrganisationType: orgType.OrganisationType,
      Status: orgType.Status,
    })
    setDialogOpen(true)
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
    setEditingOrgType(null)
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
      TransBy: "Admin", // Assuming a default user for now
      TranByUpdate: "Admin", // Assuming a default user for now
    }

    try {
      const method = editingOrgType ? "PUT" : "POST"
      const url = editingOrgType ? `${API_BASE_URL}/${editingOrgType.OrgTypeId}` : API_BASE_URL

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
        description: `Organisation type ${editingOrgType ? "updated" : "created"} successfully.`,
      })

      await fetchOrgTypes()
      handleDialogClose()
    } catch (e: any) {
      toast({
        title: "Error",
        description: `Failed to ${editingOrgType ? "update" : "create"} organisation type.`,
        variant: "destructive",
      })
      console.error(`Failed to ${editingOrgType ? "update" : "create"} organisation type:`, e)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  // if (error) return <div className="p-4 text-center text-red-500">Error: {error}</div>

  return (
      <DashboardLayout>
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Organisation Type Settings</h1>
        <Button onClick={handleAddClick} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> New
        </Button>
      </div>

      <div className="flex items-center justify-between mb-4">
        <Input
          placeholder="Search organisation types..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              
              <TableHead>Organisation Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.map((orgType) => (
              <TableRow key={orgType.OrgTypeId}>
                 
                <TableCell className="font-medium">{orgType.OrganisationType}</TableCell>
                <TableCell>{orgType.Status}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" onClick={() => handleEditClick(orgType)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <Button variant="outline" size="sm" onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingOrgType ? "Organisation Type Settings(Update)" : "Organisation Type Settings(New)"}</DialogTitle>
          
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="OrganisationType" className="text-right">
                Organisation Type
              </Label>
              <Input
                id="OrganisationType"
                name="OrganisationType"
                value={formData.OrganisationType}
                onChange={handleFormChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="Status" className="text-right">
                Status
              </Label>
              <select
                name="Status"
                id="Status"
                value={formData.Status}
                onChange={handleFormChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm col-span-3"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={handleDialogClose}>
                Cancel
              </Button>
              <Button type="submit">{editingOrgType ? "Save" : "Save"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
</DashboardLayout>
  )
}
