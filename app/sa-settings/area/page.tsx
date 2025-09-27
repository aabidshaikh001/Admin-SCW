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

interface City {
  CityId: number
  CityName: string
  StateId: number
  CountryCode: number
}

interface State {
  StateID: number
  StateName: string
  CountryCode: number
}

interface Country {
  CountryCode: number
  CountryName: string
}

interface Area {
  AreaId: number
  CityId: number
  AreaName: string
  Status: string
  TransBy: string
  AreaCode: string
}

export default function AreaPage() {
  const [areas, setAreas] = useState<Area[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [states, setStates] = useState<State[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingArea, setEditingArea] = useState<Area | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [selectedCountryCode, setSelectedCountryCode] = useState<number | null>(null)
  const [selectedStateId, setSelectedStateId] = useState<number | null>(null)
  const { toast } = useToast()

  const fetchAreasCitiesStatesAndCountries = async () => {
    try {
      const [areasResponse, citiesResponse, statesResponse, countriesResponse] = await Promise.all([
        fetch("https://api.smartcorpweb.com/api/master/areas/all"),
        fetch("https://api.smartcorpweb.com/api/master/cities/all"),
        fetch("https://api.smartcorpweb.com/api/master/states/all"),
        fetch("https://api.smartcorpweb.com/api/master/countries"),
      ])

      if (!areasResponse.ok) throw new Error(`HTTP error! status: ${areasResponse.status}`)
      if (!citiesResponse.ok) throw new Error(`HTTP error! status: ${citiesResponse.status}`)
      if (!statesResponse.ok) throw new Error(`HTTP error! status: ${statesResponse.status}`)
      if (!countriesResponse.ok) throw new Error(`HTTP error! status: ${countriesResponse.status}`)

      const areasData: Area[] = await areasResponse.json()
      const citiesData: City[] = await citiesResponse.json()
      const statesData: State[] = await statesResponse.json()
      const countriesData: Country[] = await countriesResponse.json()

      setAreas(areasData)
      setCities(citiesData)
      setStates(statesData)
      setCountries(countriesData)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch areas, cities, states or countries.",
        variant: "destructive",
      })
      console.error("Failed to fetch areas, cities, states or countries:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAreasCitiesStatesAndCountries()
  }, [])

  const handleAddArea = () => {
    setEditingArea(null)
    setDialogOpen(true)
    setSelectedCountryCode(null)
    setSelectedStateId(null)
  }

  const handleEditArea = (area: Area) => {
    setEditingArea(area)
    setDialogOpen(true)
    const city = cities.find((c) => c.CityId === area.CityId)
    if (city) {
      setSelectedStateId(city.StateId)
      const state = states.find((s) => s.StateID === city.StateId)
      if (state) {
        setSelectedCountryCode(state.CountryCode)
      }
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const data = Object.fromEntries(formData.entries()) as Partial<Area>

    // Convert Status checkbox to string
    data.Status = data.Status === "on" ? "Active" : "Inactive"
    data.CityId = Number.parseInt(data.CityId as string)

    try {
      let response
      if (editingArea) {
        response = await fetch(`https://api.smartcorpweb.com/api/master/areas/${editingArea.AreaId}`, {
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
          description: "Area updated successfully.",
        })
      } else {
        response = await fetch("https://api.smartcorpweb.com/api/master/areas", {
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
          description: "Area created successfully.",
        })
      }
      setDialogOpen(false)
      fetchAreasCitiesStatesAndCountries()
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${editingArea ? "update" : "create"} area.`,
        variant: "destructive",
      })
      console.error(`Failed to ${editingArea ? "update" : "create"} area:`, error)
    }
  }

  const filteredAreas = areas.filter(
    (area) =>
      area.AreaName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (area.AreaCode && area.AreaCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
      cities
        .find((c) => c.CityId === area.CityId)
        ?.CityName.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      states
        .find((s) => s.StateID === cities.find((c) => c.CityId === area.CityId)?.StateId)
        ?.StateName.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      countries
        .find((co) => co.CountryCode === states.find((s) => s.StateID === cities.find((c) => c.CityId === area.CityId)?.StateId)?.CountryCode)
        ?.CountryName.toLowerCase()
        .includes(searchTerm.toLowerCase())
  )

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredAreas.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredAreas.length / itemsPerPage)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  const filteredStatesByCountry = selectedCountryCode 
    ? states.filter((state) => state.CountryCode === selectedCountryCode)
    : []

  const filteredCitiesByState = selectedStateId 
    ? cities.filter((city) => city.StateId === selectedStateId)
    : []

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading areas...</div>
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Area Settings</h1>
          <Button onClick={handleAddArea} className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> New
          </Button>
        </div>

        <div className="flex items-center justify-between mb-4">
          <Input
            placeholder="Search areas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Area Name</TableHead>
                <TableHead>City</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Area Code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.length > 0 ? (
                currentItems.map((area) => {
                  const city = cities.find((c) => c.CityId === area.CityId)
                  const state = states.find((s) => s.StateID === city?.StateId)
                  const country = countries.find((co) => co.CountryCode === state?.CountryCode)
                  return (
                    <TableRow key={area.AreaId}>
                      <TableCell className="font-medium">{area.AreaName}</TableCell>
                      <TableCell>{city?.CityName || "N/A"}</TableCell>
                      <TableCell>{state?.StateName || "N/A"}</TableCell>
                      <TableCell>{country?.CountryName || "N/A"}</TableCell>
                      <TableCell>{area.AreaCode || "N/A"}</TableCell>
                      <TableCell>{area.Status}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" onClick={() => handleEditArea(area)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    No areas found
                  </TableCell>
                </TableRow>
              )}
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
            disabled={currentPage === totalPages || totalPages === 0}
          >
            Next
          </Button>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingArea ? "Area Settings (Update)" : "Area Settings (Add)"}</DialogTitle>
         
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="CountryCode" className="text-right">
                  Country
                </Label>
                <Select
                  value={selectedCountryCode?.toString() || ""}
                  onValueChange={(value) => {
                    setSelectedCountryCode(value ? Number(value) : null)
                    setSelectedStateId(null)
                  }}
                  required
                >
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
                <Label htmlFor="StateId" className="text-right">
                  State
                </Label>
                <Select
                  value={selectedStateId?.toString() || ""}
                  onValueChange={(value) => {
                    setSelectedStateId(value ? Number(value) : null)
                  }}
                  disabled={!selectedCountryCode}
                  required
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder={selectedCountryCode ? "Select a state" : "Select a country first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredStatesByCountry.length > 0 ? (
                      filteredStatesByCountry.map((state) => (
                        <SelectItem key={state.StateID} value={state.StateID.toString()}>
                          {state.StateName}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-states" disabled>
                        {selectedCountryCode ? "No states available" : "Select a country first"}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="CityId" className="text-right">
                  City
                </Label>
                <Select
                  name="CityId"
                  value={editingArea?.CityId.toString() || ""}
                  onValueChange={() => {}} // Required for controlled component
                  disabled={!selectedStateId}
                  required
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder={selectedStateId ? "Select a city" : "Select a state first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCitiesByState.length > 0 ? (
                      filteredCitiesByState.map((city) => (
                        <SelectItem key={city.CityId} value={city.CityId.toString()}>
                          {city.CityName}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-cities" disabled>
                        {selectedStateId ? "No cities available" : "Select a state first"}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="AreaName" className="text-right">
                  Area Name
                </Label>
                <Input
                  id="AreaName"
                  name="AreaName"
                  defaultValue={editingArea?.AreaName || ""}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="AreaCode" className="text-right">
                  Area Code
                </Label>
                <Input 
                  id="AreaCode" 
                  name="AreaCode" 
                  defaultValue={editingArea?.AreaCode || ""} 
                  className="col-span-3" 
                  placeholder="Optional"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="TransBy" className="text-right">
                  Transacted By
                </Label>
                <Input 
                  id="TransBy" 
                  name="TransBy" 
                  defaultValue={editingArea?.TransBy || ""} 
                  className="col-span-3" 
                  placeholder="Optional"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="Status" className="text-right">
                  Active Status
                </Label>
                <div className="col-span-3 flex items-center space-x-2">
                  <Checkbox
                    id="Status"
                    name="Status"
                    defaultChecked={editingArea?.Status === "Active" || editingArea?.Status === "Active  "}
                  />
                  <label htmlFor="Status" className="text-sm font-medium leading-none">
                    Active
                  </label>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingArea ? "Save" : "Save"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}