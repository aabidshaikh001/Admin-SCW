"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Users, Shield, ChevronDown, ChevronRight } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { toast } from "react-toastify"

interface User {
  UserId: number
  UserName: string
  UserEmail: string
  Status: string
}

interface ModuleData {
  ModuleCode: string
  ModuleName: string
  OrgName: string
  Users: User[]
}

interface ApiResponse {
  success: boolean
  data: ModuleData[]
}

export default function SuperUserModulesPage() {
  const [modules, setModules] = useState<ModuleData[]>([])
  const [filteredModules, setFilteredModules] = useState<ModuleData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetchUserModules()
  }, [])

  useEffect(() => {
    filterModules()
  }, [modules, searchTerm, statusFilter])

  const fetchUserModules = async () => {
    try {
      const response = await fetch("https://api.smartcorpweb.com/api/user-modules/all-users")
      const data: ApiResponse = await response.json()
      if (data.success) {
        setModules(data.data)
        // Initialize all modules as expanded by default
        const initialExpandedState: Record<string, boolean> = {}
        data.data.forEach(module => {
          initialExpandedState[module.ModuleCode] = true
        })
        setExpandedModules(initialExpandedState)
      }
    } catch (error) {
      toast.error("Error fetching user modules:")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const filterModules = () => {
    let filtered = [...modules]

    if (searchTerm) {
      filtered = filtered.map(module => {
        const filteredUsers = module.Users.filter(
          user =>
            user.UserName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.UserEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
            module.ModuleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            module.OrgName.toLowerCase().includes(searchTerm.toLowerCase())
        )
        
        return {
          ...module,
          Users: filteredUsers
        }
      }).filter(module => module.Users.length > 0)
    }

    if (statusFilter !== "all") {
      filtered = filtered.map(module => {
        const filteredUsers = module.Users.filter(user => user.Status === statusFilter)
        return {
          ...module,
          Users: filteredUsers
        }
      }).filter(module => module.Users.length > 0)
    }

    setFilteredModules(filtered)
  }

  const toggleModuleExpansion = (moduleCode: string) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleCode]: !prev[moduleCode]
    }))
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

  const flattenData = (modules: ModuleData[]) => {
    const rows: {
      ModuleName: string
      ModuleCode: string
      OrgName: string
      UserId: number
      UserName: string
      UserEmail: string
      Status: string
    }[] = []
    
    modules.forEach(module => {
      module.Users.forEach(user => {
        rows.push({
          ModuleName: module.ModuleName,
          ModuleCode: module.ModuleCode,
          OrgName: module.OrgName,
          UserId: user.UserId,
          UserName: user.UserName,
          UserEmail: user.UserEmail,
          Status: user.Status,
        })
      })
    })
    
    return rows
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading user modules...</div>
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">User Module Access</h1>
           
          </div>

          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users or modules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-60"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card>
          
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Module</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {flattenData(filteredModules).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
                        No user module assignments found
                      </TableCell>
                    </TableRow>
                  ) : (
                    flattenData(filteredModules).map((row, idx) => (
                      <TableRow key={`${row.ModuleCode}-${row.UserId}-${idx}`}>
                        <TableCell>{row.ModuleName}</TableCell>
                        <TableCell>{row.ModuleCode}</TableCell>
                        <TableCell>{row.OrgName}</TableCell>
                        <TableCell>{row.UserName}</TableCell>
                        <TableCell>{row.UserEmail}</TableCell>
                        <TableCell>{getStatusBadge(row.Status)}</TableCell>
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