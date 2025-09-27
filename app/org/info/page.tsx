"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, Search, Edit, Trash2, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { orgApi } from "@/lib/api"
import {DashboardLayout} from "@/components/dashboard-layout"
import Link from "next/link"

interface Organization {
  OrgID: number
  OrgCode: number
  OrgName: string
  OrgType: string
  ContactPerson: string
  Email: string
  Phone: string
  Mobile: string
  Web: string
  Logo: string
  Address1: string
  City: string
  State: string
  Country: string
  Status: string
  EstYear: number
  AdminEmail: string
  StateName: string
  CityName: string
}

export default function OrganizationInfoPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [filteredOrgs, setFilteredOrgs] = useState<Organization[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchOrganizations()
  }, [])

  useEffect(() => {
    const filtered = organizations.filter(
      (org) =>
        org.OrgName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.OrgCode?.toString().includes(searchTerm) ||
        org.ContactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.Email?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredOrgs(filtered)
  }, [searchTerm, organizations])

  const fetchOrganizations = async () => {
    try {
      setLoading(true)
      const data = await orgApi.getAll()
      setOrganizations(data)
      setFilteredOrgs(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch organizations",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this organization?")) return

    try {
      await orgApi.delete(id.toString())
      toast({
        title: "Success",
        description: "Organization deleted successfully",
      })
      fetchOrganizations()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete organization",
        variant: "destructive",
      })
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
      {/* Header + Search + New Button in one row */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full"
>
  {/* Title */}
  <h1 className="text-2xl font-bold text-foreground whitespace-nowrap">
    Organization Management
  </h1>

  {/* Search */}
  <div className="relative flex-1 max-w-md w-full">
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
    <Input
      placeholder="Search organizations..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="pl-10"
    />
  </div>

  {/* New Button */}
  <Link href="/org/info/add" className="whitespace-nowrap">
    <Button className="bg-primary hover:bg-primary/90">
      <Plus className="w-4 h-4 mr-2" />
      New
    </Button>
  </Link>
</motion.div>

        {/* Organizations Table */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <Card>
            {/* <CardHeader>
              <CardTitle>Organizations ({filteredOrgs.length})</CardTitle>
            </CardHeader> */}
           
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="animate-pulse flex space-x-4">
                      <div className="rounded-full bg-muted h-10 w-10"></div>
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredOrgs.length === 0 ? (
                <div className="text-center py-12">
                  <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground">No organizations found</h3>
                  <p className="text-sm text-muted-foreground">
                    {searchTerm ? "Try adjusting your search terms" : "Get started by adding your first organization"}
                  </p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                           <TableHead>Code</TableHead>
                        <TableHead>Organization</TableHead>
                     
                        <TableHead>Type</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrgs.map((org, index) => (
                        <motion.tr
                          key={org.OrgID}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-muted/50"
                        >
                             <TableCell className="font-mono">{org.OrgCode}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="w-8 h-8">
                          <AvatarImage
  src={org.Logo ? `https://api.smartcorpweb.com${org.Logo}` : "/placeholder.svg"}
  alt={org.OrgName}
/>

                                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                  {org.OrgName?.charAt(0) || "O"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{org.OrgName}</div>
                                {/* <div className="text-sm text-muted-foreground">Est. {org.EstYear}</div> */}
                              </div>
                            </div>
                          </TableCell>
                       
                          <TableCell>{org.OrgType}</TableCell>
                          <TableCell>{org.ContactPerson}</TableCell>
                          <TableCell>
                            <a href={`mailto:${org.Email}`} className="text-primary hover:underline">
                              {org.Email}
                            </a>
                          </TableCell>
                          <TableCell>{org.Phone || org.Mobile}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{org.CityName}</div>
                              <div className="text-muted-foreground">
                                {org.StateName}
                                
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={org.Status === "Active" ? "default" : "secondary"}>{org.Status}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Link href={`/org/info/edit/${org.OrgID}`}>
                                <Button variant="outline" size="sm">
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </Link>
                              {/* <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(org.OrgID)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button> */}
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
         
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
