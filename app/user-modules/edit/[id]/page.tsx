"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Search, Users, Shield, Calendar } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "react-toastify"

interface UserModule {
  UserModuleId: number
  UserId: number
  UserName: string
  OrgCode: number
  ModuleCode: string
  ModuleName: string
  Status: string
  TransDate: string
  TransBy: string
  TranDateUpdate?: string
  TranByUpdate?: string
}

interface ModuleUser {
  UserId: number
  UserName: string
  UserEmail: string
  OrgCode: number
  Status: string
}

interface Module {
  ModuleId: number
  ModuleCode: string
  ModuleName: string
  Status: string
  OrgCode: number
}

interface Organization {
  OrgCode: number
  OrgName: string
}

export default function EditUserModulePage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const router = useRouter()
  const [userModule, setUserModule] = useState<UserModule | null>(null)
  const [users, setUsers] = useState<ModuleUser[]>([])
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    UserId: "",
    OrgCode: user?.OrgCode?.toString() || "",
    ModuleCode: "",
    Status: "Active",
  })

  const [searchUsers, setSearchUsers] = useState("")
  const [searchModules, setSearchModules] = useState("")

  useEffect(() => {
    if (formData.OrgCode) {
      fetchData()
    }
  }, [params.id, formData.OrgCode])

  const fetchData = async () => {
    try {
      // Fetch user module details and reference data
      const [userModuleRes, usersRes, modulesRes] = await Promise.all([
        fetch(`https://api.smartcorpweb.com/api/user-modules/${params.id}`),
        fetch(`https://api.smartcorpweb.com/api/users/org/${formData.OrgCode}`),
        fetch(`https://api.smartcorpweb.com/api/assignmodules/org-modules/org/${formData.OrgCode}`),
      ])

      const userModuleData = await userModuleRes.json()
      const usersData = await usersRes.json()
      const modulesData = await modulesRes.json()

      // Handle user module data
      if (userModuleData.success) {
        const moduleData = userModuleData.data
        setUserModule(moduleData)
        setFormData({
          UserId: moduleData.UserId.toString(),
          OrgCode: moduleData.OrgCode.toString(),
          ModuleCode: moduleData.ModuleCode,
          Status: moduleData.Status,
        })
      }

      // Handle users data (array or {success, data} structure)
      if (Array.isArray(usersData)) {
        setUsers(usersData)
      } else if (usersData.success && Array.isArray(usersData.data)) {
        setUsers(usersData.data)
      }

      // Handle modules data
      if (modulesData.success && Array.isArray(modulesData.data)) {
        setModules(modulesData.data)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch(`https://api.smartcorpweb.com/api/user-modules/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          OrgCode: Number.parseInt(formData.OrgCode),
          TranByUpdate: "Admin",
        }),
      })

      const data = await response.json()

      if (data.success) {
        router.push("/user-modules")
        toast.success("User module updated successfully")
      } else {
        toast.error(data.message || "Failed to update user module")
      }
    } catch (error) {
      console.error("Error updating user module:", error)
      alert("Failed to update user module")
    } finally {
      setSubmitting(false)
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.UserName.toLowerCase().includes(searchUsers.toLowerCase()) ||
      user.UserEmail.toLowerCase().includes(searchUsers.toLowerCase()),
  )

  const filteredModules = modules.filter(
    (module) =>
      module.ModuleName.toLowerCase().includes(searchModules.toLowerCase()) ||
      module.ModuleCode.toLowerCase().includes(searchModules.toLowerCase()),
  )

  const selectedUser = users.find((user) => user.UserId.toString() === formData.UserId)

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  if (!userModule) {
    return <div className="flex items-center justify-center h-64">User module not found</div>
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Assign Module(Update)</h1>
      
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Select User
              </CardTitle>
              <CardDescription>Choose the user for this module</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="user-search">Search Users</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="user-search"
                    placeholder="Search by name or email..."
                    value={searchUsers}
                    onChange={(e) => setSearchUsers(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="userId">User *</Label>
                <Select
                  value={formData.UserId}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, UserId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredUsers.map((user) => (
                      <SelectItem key={user.UserId} value={user.UserId.toString()}>
                        <div className="flex flex-col">
                          <span className="font-medium">{user.UserName}</span>
                          <span className="text-sm text-muted-foreground">{user.UserEmail}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedUser && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Selected User:</p>
                  <p className="text-sm">{selectedUser.UserName}</p>
                  <p className="text-sm text-muted-foreground">{selectedUser.UserEmail}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Module Configuration
              </CardTitle>
              <CardDescription>Update assignment details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="module-search">Search Modules</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="module-search"
                      placeholder="Search modules..."
                      value={searchModules}
                      onChange={(e) => setSearchModules(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="moduleCode">Module *</Label>
                  <Select
                    value={formData.ModuleCode}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, ModuleCode: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a module" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredModules.map((module) => (
                        <SelectItem key={module.ModuleCode} value={module.ModuleCode}>
                          <div className="flex flex-col">
                            <span className="font-medium">{module.ModuleName}</span>
                            <span className="text-sm text-muted-foreground">{module.ModuleCode}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.Status}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, Status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={submitting || !formData.UserId || !formData.ModuleCode || !formData.OrgCode}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {submitting ? "Updating..." : "Update Assignment"}
                  </Button>
                  <Link href="/user-modules">
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}