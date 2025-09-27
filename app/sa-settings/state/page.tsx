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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DashboardLayout } from "@/components/dashboard-layout"
interface Country {
  CountryCode: number
  CountryName: string
}

interface State {
  StateId: number
  StateCode: string
  CountryCode: number
  StateType: string
  StateName: string
  StateCapital: string
  StateAbbr: string
  Status: string
}

export default function StatePage() {
  const [states, setStates] = useState<State[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingState, setEditingState] = useState<State | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10) // Items per page for pagination
  const { toast } = useToast()

  const fetchStatesAndCountries = async () => {
    try {
      const [statesResponse, countriesResponse] = await Promise.all([
        fetch("https://api.smartcorpweb.com/api/master/states/all"),
        fetch("https://api.smartcorpweb.com/api/master/countries"),
      ])

      if (!statesResponse.ok) throw new Error(`HTTP error! status: ${statesResponse.status}`)
      if (!countriesResponse.ok) throw new Error(`HTTP error! status: ${countriesResponse.status}`)

      const statesData: State[] = await statesResponse.json()
      const countriesData: Country[] = await countriesResponse.json()

      setStates(statesData)
      setCountries(countriesData)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch states or countries.",
        variant: "destructive",
      })
      console.error("Failed to fetch states or countries:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatesAndCountries()
  }, [])

  const handleAddState = () => {
    setEditingState(null)
    setDialogOpen(true)
  }

  const handleEditState = (state: State) => {
    setEditingState(state)
    setDialogOpen(true)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const data = Object.fromEntries(formData.entries()) as Partial<State>

    // Convert Status checkbox to string
    data.Status = data.Status === "on" ? "Active" : "Inactive"
    data.CountryCode = Number.parseInt(data.CountryCode as string)

    try {
      let response
      if (editingState) {
        response = await fetch(`https://api.smartcorpweb.com/api/master/states/${editingState.StateId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        toast({
          title: "Success",
          description: "State updated successfully.",
        })
      } else {
        response = await fetch("https://api.smartcorpweb.com/api/master/states", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        toast({
          title: "Success",
          description: "State created successfully.",
        })
      }
      setDialogOpen(false)
      fetchStatesAndCountries()
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${editingState ? "update" : "create"} state.`,
        variant: "destructive",
      })
      console.error(`Failed to ${editingState ? "update" : "create"} state:`, error)
    }
  }

  const filteredStates = states.filter(
    (state) =>
      state.StateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      countries
        .find((c) => c.CountryCode === state.CountryCode)
        ?.CountryName.toLowerCase()
        .includes(searchTerm.toLowerCase()),
  )

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredStates.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredStates.length / itemsPerPage)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)
  // </CHANGE>

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading states...</div>
  }

  return (
    <DashboardLayout>
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">State Settings</h1>
        <Button onClick={handleAddState} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> New
        </Button>
      </div>

      <div className="flex items-center justify-between mb-4">
        <Input
          placeholder="Search states..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
             
              <TableHead>State Name</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>State Code</TableHead>
              <TableHead>State Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.map((state) => (
              <TableRow key={state.StateId}>
               
                <TableCell className="font-medium">{state.StateName}</TableCell>
                <TableCell>
                  {countries.find((c) => c.CountryCode === state.CountryCode)?.CountryName || "N/A"}
                </TableCell>
                <TableCell>{state.StateCode}</TableCell>
                <TableCell>{state.StateType}</TableCell>
                <TableCell>{state.Status}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" onClick={() => handleEditState(state)}>
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
      {/* </CHANGE> */}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingState ? "State Settings(Update)" : "State Settings(New)"}</DialogTitle>
        
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="CountryCode" className="text-right">
                Country
              </Label>
              <Select name="CountryCode" defaultValue={editingState?.CountryCode.toString() || ""} required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.CountryCode} value={country.CountryCode.toString()}>
                      {country.CountryName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="StateName" className="text-right">
                State Name
              </Label>
              <Input
                id="StateName"
                name="StateName"
                defaultValue={editingState?.StateName || ""}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="StateCode" className="text-right">
                State Code
              </Label>
              <Input
                id="StateCode"
                name="StateCode"
                defaultValue={editingState?.StateCode || ""}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="StateType" className="text-right">
                State Type
              </Label>
              <Input
                id="StateType"
                name="StateType"
                defaultValue={editingState?.StateType || ""}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="StateCapital" className="text-right">
                State Capital
              </Label>
              <Input
                id="StateCapital"
                name="StateCapital"
                defaultValue={editingState?.StateCapital || ""}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="StateAbbr" className="text-right">
                State Abbreviation
              </Label>
              <Input
                id="StateAbbr"
                name="StateAbbr"
                defaultValue={editingState?.StateAbbr || ""}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="Status" className="text-right">
                Status
              </Label>
              <Checkbox
                id="Status"
                name="Status"
                defaultChecked={editingState?.Status === "Active"}
                className="col-span-3"
              />
            </div>
            <Button type="submit" className="w-full">
              {editingState ? "Save" : "Save"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
    </DashboardLayout>
  )
}
