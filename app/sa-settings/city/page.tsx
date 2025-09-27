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
  StateID: number // Fixed: Changed from StateId to StateID to match API response
  StateName: string
  CountryCode: number
}

interface City {
  CityId: number
  CountryCode: number
  StateId: number
  CityName: string
  Status: string
  CityImage: string | null
  CityIcon: string | null
}

export default function CityPage() {
  const [cities, setCities] = useState<City[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [states, setStates] = useState<State[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCity, setEditingCity] = useState<City | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [selectedCountryCode, setSelectedCountryCode] = useState<number | null>(null)
  const { toast } = useToast()

  const fetchCitiesStatesAndCountries = async () => {
    try {
      const [citiesResponse, countriesResponse, statesResponse] = await Promise.all([
        fetch("https://api.smartcorpweb.com/api/master/cities/all"),
        fetch("https://api.smartcorpweb.com/api/master/countries"),
        fetch("https://api.smartcorpweb.com/api/master/states/all"),
      ])

      if (!citiesResponse.ok) throw new Error(`HTTP error! status: ${citiesResponse.status}`)
      if (!countriesResponse.ok) throw new Error(`HTTP error! status: ${countriesResponse.status}`)
      if (!statesResponse.ok) throw new Error(`HTTP error! status: ${statesResponse.status}`)

      const citiesData: City[] = await citiesResponse.json()
      const countriesData: Country[] = await countriesResponse.json()
      const statesData: State[] = await statesResponse.json()

      setCities(citiesData)
      setCountries(countriesData)
      setStates(statesData)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch cities, states or countries.",
        variant: "destructive",
      })
      console.error("Failed to fetch cities, states or countries:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCitiesStatesAndCountries()
  }, [])

  const handleAddCity = () => {
    setEditingCity(null)
    setDialogOpen(true)
    setSelectedCountryCode(null)
  }

  const handleEditCity = (city: City) => {
    setEditingCity(city)
    setDialogOpen(true)
    setSelectedCountryCode(city.CountryCode)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const data = Object.fromEntries(formData.entries()) as Partial<City>

    // Convert Status checkbox to string
    data.Status = data.Status === "on" ? "Active" : "Inactive"
    data.CountryCode = Number.parseInt(data.CountryCode as string)
    data.StateId = Number.parseInt(data.StateId as string)

    // Handle null values for image and icon
    data.CityImage = data.CityImage || null
    data.CityIcon = data.CityIcon || null

    try {
      let response
      if (editingCity) {
        response = await fetch(`https://api.smartcorpweb.com/api/master/cities/${editingCity.CityId}`, {
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
          description: "City updated successfully.",
        })
      } else {
        response = await fetch("https://api.smartcorpweb.com/api/master/cities", {
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
          description: "City created successfully.",
        })
      }
      setDialogOpen(false)
      fetchCitiesStatesAndCountries()
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${editingCity ? "update" : "create"} city.`,
        variant: "destructive",
      })
      console.error(`Failed to ${editingCity ? "update" : "create"} city:`, error)
    }
  }

  const filteredCities = cities.filter(
    (city) =>
      city.CityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      countries
        .find((c) => c.CountryCode === city.CountryCode)
        ?.CountryName.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      states
        .find((s) => s.StateID === city.StateId) // Fixed: Use StateID instead of StateId
        ?.StateName.toLowerCase()
        .includes(searchTerm.toLowerCase()),
  )

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredCities.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredCities.length / itemsPerPage)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  // Fixed: Handle null selectedCountryCode safely
  const filteredStates = selectedCountryCode 
    ? states.filter((state) => state.CountryCode === selectedCountryCode)
    : states

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading cities...</div>
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">City Settings</h1>
          <Button onClick={handleAddCity} className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> New
          </Button>
        </div>

        <div className="flex items-center justify-between mb-4">
          <Input
            placeholder="Search cities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>City Name</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.map((city) => (
                <TableRow key={city.CityId}>
                  <TableCell className="font-medium">{city.CityName}</TableCell>
                  <TableCell>{countries.find((c) => c.CountryCode === city.CountryCode)?.CountryName || "N/A"}</TableCell>
                  <TableCell>{states.find((s) => s.StateID === city.StateId)?.StateName || "N/A"}</TableCell> {/* Fixed: Use StateID */}
                  <TableCell>{city.Status}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" onClick={() => handleEditCity(city)}>
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
            disabled={currentPage === totalPages || totalPages === 0}
          >
            Next
          </Button>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingCity ? "City Settings(Update)" : "City Settings(New)"}</DialogTitle>
            
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="CountryCode" className="text-right">
                  Country
                </Label>
                <Select
                  name="CountryCode"
                  value={selectedCountryCode?.toString() || editingCity?.CountryCode.toString() || ""}
                  onValueChange={(value) => setSelectedCountryCode(Number(value))}
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
                  name="StateId" 
                  defaultValue={editingCity?.StateId.toString() || ""} 
                  required
                  disabled={!selectedCountryCode && !editingCity}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder={selectedCountryCode || editingCity ? "Select a state" : "Select a country first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredStates.length > 0 ? (
                      filteredStates.map((state) => (
                        <SelectItem key={state.StateID} value={state.StateID.toString()}>
                          {state.StateName}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>
                        No states available for selected country
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="CityName" className="text-right">
                  City Name
                </Label>
                <Input
                  id="CityName"
                  name="CityName"
                  defaultValue={editingCity?.CityName || ""}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="CityImage" className="text-right">
                  City Image URL
                </Label>
                <Input
                  id="CityImage"
                  name="CityImage"
                  defaultValue={editingCity?.CityImage || ""}
                  className="col-span-3"
                  placeholder="Optional"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="CityIcon" className="text-right">
                  City Icon URL
                </Label>
                <Input 
                  id="CityIcon" 
                  name="CityIcon" 
                  defaultValue={editingCity?.CityIcon || ""} 
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
                    defaultChecked={editingCity?.Status === "Active" || editingCity?.Status === "Active  "}
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
                  {editingCity ? "Save" : "Save"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}