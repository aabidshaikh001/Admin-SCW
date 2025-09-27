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

interface SubscType {
  SubID: number
  SubsCName: string
  Status: string
}

export default function SubscTypePage() {
  const [subscTypes, setSubscTypes] = useState<SubscType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSubscType, setEditingSubscType] = useState<SubscType | null>(null)
  const [formData, setFormData] = useState({
    SubsCName: "",
    Status: "Active",
  })
  const { toast } = useToast()

  const API_BASE_URL = "https://api.smartcorpweb.com/api/masterorg/subsc-types"

  const fetchSubscTypes = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/all`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setSubscTypes(data)
    } catch (e: any) {
      toast({
        title: "Error",
        description: "Failed to fetch subscription types.",
        variant: "destructive",
      })
      console.error("Failed to fetch subscription types:", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubscTypes()
  }, [])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const filteredSubscTypes = subscTypes.filter((subscType) =>
    Object.values(subscType).some((value) => String(value).toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredSubscTypes.slice(indexOfFirstItem, indexOfLastItem)

  const totalPages = Math.ceil(filteredSubscTypes.length / itemsPerPage)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  const handleAddClick = () => {
    setEditingSubscType(null)
    setFormData({
      SubsCName: "",
      Status: "Active",
    })
    setDialogOpen(true)
  }

  const handleEditClick = (subscType: SubscType) => {
    setEditingSubscType(subscType)
    setFormData({
      SubsCName: subscType.SubsCName,
      Status: subscType.Status,
    })
    setDialogOpen(true)
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
    setEditingSubscType(null)
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
      const method = editingSubscType ? "PUT" : "POST"
      const url = editingSubscType ? `${API_BASE_URL}/${editingSubscType.SubID}` : API_BASE_URL

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
        description: `Subscription type ${editingSubscType ? "updated" : "created"} successfully.`,
      })

      await fetchSubscTypes()
      handleDialogClose()
    } catch (e: any) {
      toast({
        title: "Error",
        description: `Failed to ${editingSubscType ? "update" : "create"} subscription type.`,
        variant: "destructive",
      })
      console.error(`Failed to ${editingSubscType ? "update" : "create"} subscription type:`, e)
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
        <h1 className="text-2xl font-bold">Subscription Type Settings</h1>
        <Button onClick={handleAddClick} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> New
        </Button>
      </div>

      <div className="flex items-center justify-between mb-4">
        <Input
          placeholder="Search subscription types..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              
              <TableHead>Subscription Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.map((subscType) => (
              <TableRow key={subscType.SubID}>
                 
                <TableCell className="font-medium">{subscType.SubsCName}</TableCell>
                <TableCell>{subscType.Status}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" onClick={() => handleEditClick(subscType)}>
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
            <DialogTitle>{editingSubscType ? "Subscription Type Settings(Update)" : "Subscription Type Settings(New)"}</DialogTitle>
         
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="SubsCName" className="text-right">
                Subscription Name
              </Label>
              <Input
                id="SubsCName"
                name="SubsCName"
                value={formData.SubsCName}
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
              <Button type="submit">{editingSubscType ? "Save" : "Save"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
</DashboardLayout>
  )
}
