"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Users } from "lucide-react"
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
}

export default function UserModulesMatrixPage() {
  const { user } = useAuth()
  const [userModules, setUserModules] = useState<UserModule[]>([])
  const [filteredModules, setFilteredModules] = useState<UserModule[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchUserModules()
  }, [])

  useEffect(() => {
    filterModules()
  }, [userModules, searchTerm])

  const fetchUserModules = async () => {
    try {
      const response = await fetch(`https://api.smartcorpweb.com/api/user-modules/org/${user?.OrgCode}`)
      const data = await response.json()
      if (data.success) {
        setUserModules(data.data)
      }
    } catch (error) {
      toast.error("Error fetching user modules")
    } finally {
      setLoading(false)
    }
  }

  const filterModules = () => {
    if (!searchTerm) {
      setFilteredModules(userModules)
      return
    }

    const filtered = userModules.filter(
      (m) =>
        m.UserName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.ModuleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.OrgName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredModules(filtered)
  }

  // Prepare matrix: group by User
  const groupedUsers = filteredModules.reduce((acc: any, item) => {
    if (!acc[item.UserId]) {
      acc[item.UserId] = {
        UserId: item.UserId,
        UserName: item.UserName,
        OrgName: item.OrgName,
        modules: {}
      }
    }
    acc[item.UserId].modules[item.ModuleName] = item.Status
    return acc
  }, {})

  const userRows = Object.values(groupedUsers)
  const allModules = Array.from(new Set(filteredModules.map((m) => m.ModuleName)))

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  const getStatusBadge = (status: string) =>
    status === "Active" ? (
      <span className="text-green-600 font-bold">✓</span>
    ) : (
      <span className="text-red-600 font-bold">✗</span>
    )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight">User Modules Matrix</h1>

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
      
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Organization</TableHead>
                    {allModules.map((module) => (
                      <TableHead key={module} className="text-center">
                        {module}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2 + allModules.length} className="text-center py-8 text-muted-foreground">
                        <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
                        No user module assignments found
                      </TableCell>
                    </TableRow>
                  ) : (
                    userRows.map((user) => (
                      <TableRow key={user.UserId}>
                        <TableCell className="font-medium">{user.UserName}</TableCell>
                        <TableCell>{user.OrgName}</TableCell>
                        {allModules.map((module) => (
                          <TableCell key={module} className="text-center">
                            {user.modules[module] ? getStatusBadge(user.modules[module]) : <span className="text-red-600">✗</span>}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            </Card>
      </div>
    </DashboardLayout>
  )
}
