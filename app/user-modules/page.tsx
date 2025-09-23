"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Edit, Trash2, Users, Shield } from "lucide-react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { toast } from "react-toastify"
import { useAuth } from "@/contexts/auth-context"

interface UserModule {
  
  ModuleId: number
  UserId: string
  UserName: string
  OrgCode: number
  OrgName: string
  ModuleCode: string
  ModuleName: string
  Status: string
  TransDate: string
  TransBy: string
  TranDateUpdate?: string
  TranByUpdate?: string
}

export default function UserModulesPage() {
  const { user } = useAuth()
  const [userModules, setUserModules] = useState<UserModule[]>([])
  const [filteredModules, setFilteredModules] = useState<UserModule[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [orgFilter, setOrgFilter] = useState("all")

  useEffect(() => {
    fetchUserModules()
  }, [])

  useEffect(() => {
    filterModules()
  }, [userModules, searchTerm, statusFilter, orgFilter])

  const fetchUserModules = async () => {
    try {
      const response = await fetch(`https://api.smartcorpweb.com/api/user-modules/org/${user?.OrgCode}`)
      const data = await response.json()
      if (data.success) {
        setUserModules(data.data)
      }
    } catch (error) {
      toast.error("Error fetching user modules:", error)

    } finally {
      setLoading(false)
    }
  }

  const filterModules = () => {
    let filtered = userModules

    if (searchTerm) {
      filtered = filtered.filter(
        (module) =>
          module.UserName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          module.ModuleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          module.OrgName.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((module) => module.Status === statusFilter)
    }

    if (orgFilter !== "all") {
      filtered = filtered.filter((module) => module.OrgCode.toString() === orgFilter)
    }

    setFilteredModules(filtered)
  }

  const handleDelete = async (moduleId: number) => {
    if (!confirm("Are you sure you want to remove this module assignment?")) return

    try {
      const response = await fetch(`https://api.smartcorpweb.com/api/user-modules/${moduleId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deletedBy: "Admin" }),
      })


      if (response.ok) {
        fetchUserModules()
        toast.success("User module assignment removed successfully")
      }
      
    } catch (error) {
      toast.error("Error deleting user module:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    return status === "Active" ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        Active
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-red-100 text-red-800">
        Inactive
      </Badge>
    )
  }

  const uniqueOrgs = Array.from(new Set(userModules.map((m) => ({ code: m.OrgCode, name: m.OrgName }))))

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading user modules...</div>
  }

  return (
    <DashboardLayout>
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
  <h1 className="text-2xl font-bold tracking-tight">User Module</h1>

  {/* Search bar */}
  <div className="relative flex-1 max-w-sm">
    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
    <Input
      placeholder="Search by user, module, or organization..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="pl-10"
    />
  </div>

  <Link href="/user-modules/assign">
    <Button>
      <Plus className="mr-2 h-4 w-4" />
      Assign
    </Button>
  </Link>
</div>

      <Card>
       
        <CardContent>
          
           

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned Date</TableHead>
                  <TableHead>Assigned By</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredModules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
                      No user module assignments found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredModules.map((module) => (
                    <TableRow key={module.ModuleId}>
                      <TableCell className="font-medium">{module.UserName}</TableCell>
                      <TableCell>{module.ModuleName}</TableCell>
                      <TableCell>{module.OrgName}</TableCell>
                      <TableCell>{getStatusBadge(module.Status)}</TableCell>
                      <TableCell>{new Date(module.TransDate).toLocaleDateString()}</TableCell>
                      <TableCell>{module.TransBy}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/user-modules/edit/${module.ModuleId}`}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(module.ModuleId)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
    </DashboardLayout>
  )
}
