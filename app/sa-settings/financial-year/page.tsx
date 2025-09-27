"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { CalendarDays, Pencil, Plus, Search } from "lucide-react"
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

interface FinYear {
  FinId: number
  OrgCode: number
  FinYear: string
  FinYearStart: string
  FinYearEnd: string
  Status: string
}

export default function FinancialYearPage() {
  const [finYears, setFinYears] = useState<FinYear[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingFinYear, setEditingFinYear] = useState<FinYear | null>(null)
  const [formData, setFormData] = useState({
    OrgCode: "",
    FinYear: "",
    FinYearStart: "",
    FinYearEnd: "",
    Status: "Active",
  })
  const { toast } = useToast()

  const API_BASE_URL = "https://api.smartcorpweb.com/api/masterorg/fin-years"

  const fetchFinYears = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE_URL}/all`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setFinYears(data)
    } catch (e: any) {
      setError(e.message)
      toast({
        title: "Error",
        description: "Failed to fetch financial years.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFinYears()
  }, [])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const filteredFinYears = finYears.filter((finYear) =>
    Object.values(finYear).some((value) => String(value).toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredFinYears.slice(indexOfFirstItem, indexOfLastItem)

  const totalPages = Math.ceil(filteredFinYears.length / itemsPerPage)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  const handleAddClick = () => {
    setEditingFinYear(null)
    setFormData({
      OrgCode: "",
      FinYear: "",
      FinYearStart: "",
      FinYearEnd: "",
      Status: "Active",
    })
    setIsDialogOpen(true)
  }

  const handleEditClick = (finYear: FinYear) => {
    setEditingFinYear(finYear)
    setFormData({
      OrgCode: String(finYear.OrgCode),
      FinYear: finYear.FinYear,
      FinYearStart: finYear.FinYearStart,
      FinYearEnd: finYear.FinYearEnd,
      Status: finYear.Status,
    })
    setIsDialogOpen(true)
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setEditingFinYear(null)
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const payload = {
      ...formData,
      OrgCode: Number.parseInt(formData.OrgCode),
      TransBy: "Admin", // Assuming a default user for now
      TranByUpdate: "Admin", // Assuming a default user for now
    }

    try {
      const method = editingFinYear ? "PUT" : "POST"
      const url = editingFinYear ? `${API_BASE_URL}/${editingFinYear.FinId}` : API_BASE_URL

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
        description: `Financial year ${editingFinYear ? "updated" : "created"} successfully.`,
      })

      await fetchFinYears()
      handleDialogClose()
    } catch (e: any) {
      setError(e.message)
      toast({
        title: "Error",
        description: `Failed to ${editingFinYear ? "update" : "create"} financial year.`,
        variant: "destructive",
      })
      console.error(`Failed to ${editingFinYear ? "update" : "create"} financial year:`, e)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading financial years...</p>
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
            <CardDescription>Failed to load financial years.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button onClick={fetchFinYears} className="mt-4 w-full">
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
            <h1 className="text-2xl font-bold tracking-tight">Financial Year Management</h1>
          
          </div>
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search financial years..."
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
                  <TableHead className="w-[50px]">
                    <Checkbox checked={false} onCheckedChange={() => {}} aria-label="Select all" />
                  </TableHead>
                  <TableHead>Organization Code</TableHead>
                  <TableHead>Financial Year</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No financial years found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentItems.map((finYear) => (
                    <TableRow key={finYear.FinId}>
                      <TableCell>
                        <Checkbox checked={false} onCheckedChange={() => {}} aria-label="Select row" />
                      </TableCell>
                      <TableCell className="font-medium">{finYear.OrgCode}</TableCell>
                      <TableCell>{finYear.FinYear}</TableCell>
                      <TableCell>{finYear.FinYearStart}</TableCell>
                      <TableCell>{finYear.FinYearEnd}</TableCell>
                      <TableCell>
                        <Badge variant={finYear.Status === "Active" ? "default" : "secondary"}>{finYear.Status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleEditClick(finYear)}>
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
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredFinYears.length)} of{" "}
                {filteredFinYears.length} entries
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
            <DialogTitle>{editingFinYear ? "Financial Year Management(Update)" : "Financial Year Management(New)"}</DialogTitle>
           
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
                <Label htmlFor="FinYear">Financial Year</Label>
                <Input
                  id="FinYear"
                  name="FinYear"
                  value={formData.FinYear}
                  onChange={handleFormChange}
                  placeholder="e.g., 2023-2024"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="FinYearStart">Start Date</Label>
                <Input
                  id="FinYearStart"
                  name="FinYearStart"
                  type="date"
                  value={formData.FinYearStart}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="FinYearEnd">End Date</Label>
                <Input
                  id="FinYearEnd"
                  name="FinYearEnd"
                  type="date"
                  value={formData.FinYearEnd}
                  onChange={handleFormChange}
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
                {loading ? "Saving..." : editingFinYear ? "Save" : "Save"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
</DashboardLayout>
  )
}
