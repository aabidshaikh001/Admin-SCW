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
interface Country {
  CountryCode: number
  CountryName: string
  ALPHA2: string
  ALPHA3: string
  ISO3166: string
  CountryRegionCode: number
  CountryRegion: string
  CountrySubRegCode: number
  CountrySubReg: string
  IntlDealing: string
  Status: string
}

export default function CountryPage() {
  const [countries, setCountries] = useState<Country[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCountry, setEditingCountry] = useState<Country | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10) // Items per page for pagination
  const { toast } = useToast()

  const fetchCountries = async () => {
    try {
      const response = await fetch("https://api.smartcorpweb.com/api/master/countries")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data: Country[] = await response.json()
      setCountries(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch countries.",
        variant: "destructive",
      })
      console.error("Failed to fetch countries:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCountries()
  }, [])

  const handleAddCountry = () => {
    setEditingCountry(null)
    setDialogOpen(true)
  }

  const handleEditCountry = (country: Country) => {
    setEditingCountry(country)
    setDialogOpen(true)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const data = Object.fromEntries(formData.entries()) as Partial<Country>

    // Convert Status checkbox to string
    data.Status = data.Status === "on" ? "Active" : "Inactive"

    try {
      let response
      if (editingCountry) {
        response = await fetch(`https://api.smartcorpweb.com/api/master/countries/${editingCountry.CountryCode}`, {
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
          description: "Country updated successfully.",
        })
      } else {
        response = await fetch("https://api.smartcorpweb.com/api/master/countries", {
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
          description: "Country created successfully.",
        })
      }
      setDialogOpen(false)
      fetchCountries()
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${editingCountry ? "update" : "create"} country.`,
        variant: "destructive",
      })
      console.error(`Failed to ${editingCountry ? "update" : "create"} country:`, error)
    }
  }

  const filteredCountries = countries.filter((country) =>
    country.CountryName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredCountries.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredCountries.length / itemsPerPage)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)
  // </CHANGE>

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading countries...</div>
  }

  return (
    <DashboardLayout>
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Country Settings</h1>
        <Button onClick={handleAddCountry} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> New
        </Button>
      </div>

      <div className="flex items-center justify-between mb-4">
        <Input
          placeholder="Search countries..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              
              <TableHead>Country Name</TableHead>
              <TableHead>ALPHA2</TableHead>
              <TableHead>ALPHA3</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.map((country) => (
              <TableRow key={country.CountryCode}>
               
                <TableCell className="font-medium">{country.CountryName}</TableCell>
                <TableCell>{country.ALPHA2}</TableCell>
                <TableCell>{country.ALPHA3}</TableCell>
                <TableCell>{country.Status}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" onClick={() => handleEditCountry(country)}>
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
            <DialogTitle>{editingCountry ? "Country Settings(Update)" : "Country Settings(New)"}</DialogTitle>
          
          </DialogHeader>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="CountryName" className="text-right">
                Country Name
              </Label>
              <Input
                id="CountryName"
                name="CountryName"
                defaultValue={editingCountry?.CountryName || ""}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ALPHA2" className="text-right">
                ALPHA2
              </Label>
              <Input id="ALPHA2" name="ALPHA2" defaultValue={editingCountry?.ALPHA2 || ""} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ALPHA3" className="text-right">
                ALPHA3
              </Label>
              <Input id="ALPHA3" name="ALPHA3" defaultValue={editingCountry?.ALPHA3 || ""} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ISO3166" className="text-right">
                ISO3166
              </Label>
              <Input id="ISO3166" name="ISO3166" defaultValue={editingCountry?.ISO3166 || ""} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="CountryRegionCode" className="text-right">
                Region Code
              </Label>
              <Input
                id="CountryRegionCode"
                name="CountryRegionCode"
                type="number"
                defaultValue={editingCountry?.CountryRegionCode || ""}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="CountryRegion" className="text-right">
                Region
              </Label>
              <Input
                id="CountryRegion"
                name="CountryRegion"
                defaultValue={editingCountry?.CountryRegion || ""}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="CountrySubRegCode" className="text-right">
                Sub-Region Code
              </Label>
              <Input
                id="CountrySubRegCode"
                name="CountrySubRegCode"
                type="number"
                defaultValue={editingCountry?.CountrySubRegCode || ""}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="CountrySubReg" className="text-right">
                Sub-Region
              </Label>
              <Input
                id="CountrySubReg"
                name="CountrySubReg"
                defaultValue={editingCountry?.CountrySubReg || ""}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="IntlDealing" className="text-right">
                Intl Dealing
              </Label>
              <Input
                id="IntlDealing"
                name="IntlDealing"
                defaultValue={editingCountry?.IntlDealing || ""}
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
                defaultChecked={editingCountry?.Status === "Active"}
                className="col-span-3"
              />
            </div>
            <Button type="submit" className="w-full">
              {editingCountry ? "Save" : "Save"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
    </DashboardLayout>
  )
}
