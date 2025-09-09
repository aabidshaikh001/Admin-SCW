"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, Search, Edit, Trash2, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { orgLicenseApi } from "@/lib/api"
import {DashboardLayout} from "@/components/dashboard-layout"
import Link from "next/link"

interface License {
  LicenseID: number
  LicenseName: string
  LicenseKey: string
  OrgCode: number
  MaxUsers: number
  MaxVisitors: number
  Status: string
  TransDate: string
  IsDeleted: boolean
}

export default function OrganizationLicensePage() {
  const [licenses, setLicenses] = useState<License[]>([])
  const [filteredLicenses, setFilteredLicenses] = useState<License[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const { toast } = useToast()

  useEffect(() => {
    fetchLicenses()
  }, [])

  useEffect(() => {
    filterLicenses()
  }, [licenses, searchTerm, statusFilter])

  const fetchLicenses = async () => {
    try {
      setLoading(true)
      const data = await orgLicenseApi.getAll()
      setLicenses(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch licenses",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterLicenses = () => {
    let filtered = licenses

    if (searchTerm) {
      filtered = filtered.filter(
        (license) =>
          license.LicenseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          license.OrgCode.toString().includes(searchTerm) ||
          license.LicenseKey.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((license) => license.Status.toLowerCase() === statusFilter)
    }

    setFilteredLicenses(filtered)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this license?")) return

    try {
      await orgLicenseApi.delete(id.toString())
      toast({
        title: "Success",
        description: "License deleted successfully",
      })
      fetchLicenses()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete license",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "inactive":
        return "bg-red-100 text-red-800 border-red-200"
      case "expired":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
       <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row justify-between items-center gap-4">
  <h1 className="text-2xl font-bold text-foreground">License Management</h1>
  <div className="flex flex-1 sm:flex-none items-center gap-4">

    <div className="relative flex-1 sm:w-48">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
      <Input placeholder="Search licenses..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
    </div>
    <Select value={statusFilter} onValueChange={setStatusFilter}>
      <SelectTrigger className="w-full sm:w-40"><Filter className="w-4 h-4 mr-2" /><SelectValue placeholder="All Status" /></SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Status</SelectItem>
        <SelectItem value="active">Active</SelectItem>
        <SelectItem value="inactive">Inactive</SelectItem>
        
      </SelectContent>
    </Select>
    
  </div>
  
</motion.div>

        {/* Licenses Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            
           
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>License Name</TableHead>
                        <TableHead>Org Code</TableHead>
                        <TableHead>Max Users</TableHead>
                        <TableHead>Max Visitors</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLicenses.map((license, index) => (
                        <motion.tr
                          key={license.LicenseID}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-muted/50"
                        >
                          <TableCell className="font-medium">{license.LicenseName}</TableCell>
                          <TableCell>{license.OrgCode}</TableCell>
                          <TableCell>{license.MaxUsers.toLocaleString()}</TableCell>
                          <TableCell>{license.MaxVisitors.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(license.Status)}>{license.Status}</Badge>
                          </TableCell>
                          <TableCell>{new Date(license.TransDate).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Link href={`/org/license/edit/${license.LicenseID}`}>
                                <Button variant="outline" size="sm">
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </Link>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(license.LicenseID)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                  {filteredLicenses.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">No licenses found</div>
                  )}
                </div>
              )}
           
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
