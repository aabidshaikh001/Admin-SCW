"use client"

import { useState, useEffect } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "react-toastify"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useAuth } from "@/contexts/auth-context"

interface User {
  UserId: number
  UserName: string
  UserEmail: string
  OrgCode: number
}

interface Module {
  ModuleId: number
  ModuleName: string
  ModuleCode: string
  isAssignable: boolean
}

interface AssignedModule {
  ModuleId: number
  ModuleCode: string
  ModuleName: string
  Status: string
  UserId: number
}

export default function AssignUserModulesPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [modules, setModules] = useState<Module[]>([])
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [assignedModules, setAssignedModules] = useState<number[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch users and modules
 useEffect(() => {
  if (user?.OrgCode) {
    fetchUsers()
    fetchModules()
  }
}, [user])

  // Fetch assigned modules when user changes
  useEffect(() => {
    if (selectedUserId) fetchAssignedModules(selectedUserId)
    else setAssignedModules([])
  }, [selectedUserId])

 const fetchUsers = async () => {
  if (!user?.OrgCode) return
  try {
    setLoading(true)
    const res = await fetch(`https://api.smartcorpweb.com/api/users/org/${user.OrgCode}`)
    const data: User[] = await res.json() // <-- directly use the array
    setUsers(data)
  } catch (err) {
    console.error(err)
    toast.error("Failed to load users")
  } finally {
    setLoading(false)
  }
}

const fetchModules = async () => {
  try {
    setLoading(true)
    const res = await fetch("https://api.smartcorpweb.com/api/assignmodules/org-modules/org/" + user?.OrgCode)
    const data: { success: boolean; data: (Module & { isAssignable: boolean })[] } = await res.json()
    if (data.success) {
      // Only keep modules that are assignable
   setModules(data.data) // keep all modules

  
    } else {
      toast.error("Failed to load modules")
    }
  } catch (err) {
    console.error(err)
    toast.error("Failed to load modules")
  } finally {
    setLoading(false)
  }
}


  const fetchAssignedModules = async (userId: number) => {
    try {
      setLoading(true)
      const res = await fetch(`https://api.smartcorpweb.com/api/user-modules/user/${userId}`)
      const data: { success: boolean; data: AssignedModule[] } = await res.json()
      if (data.success) {
        const moduleIds = data.data.map((m) => m.ModuleId)
        setAssignedModules(moduleIds)
      } else {
        setAssignedModules([])
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to fetch assigned modules")
      setAssignedModules([])
    } finally {
      setLoading(false)
    }
  }

  const toggleModule = async (moduleId: number) => {
  if (!selectedUserId) return toast.error("Select a user first")
  const isAssigned = assignedModules.includes(moduleId)
  try {
    setLoading(true)
    if (isAssigned) {
      // Unassign module
      const res = await fetch(`https://api.smartcorpweb.com/api/user-modules/${moduleId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      })
      const data = await res.json()
      if (data.success) {
        setAssignedModules((prev) => prev.filter((id) => id !== moduleId))
        toast.success("Module unassigned successfully") // ✅ success toast
      } else {
        toast.error(data.message || "Failed to unassign module")
      }
    } else {
      // Assign module
      const module = modules.find((m) => m.ModuleId === moduleId)
      const res = await fetch("https://api.smartcorpweb.com/api/user-modules/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          UserId: selectedUserId,
          ModuleId: moduleId,
          OrgCode: user?.OrgCode,
          ModuleCode: module?.ModuleCode,
          Status: "Active",
          TransBy: "Admin",
        }),
      })
      const data = await res.json()
      if (data.success) {
        setAssignedModules((prev) => [...prev, moduleId])
        toast.success("Module assigned successfully") // ✅ success toast
      } else {
        toast.error(data.message || "Failed to assign module")
      }
    }
  } catch (err) {
    console.error(err)
    toast.error("Network error. Try again")
  } finally {
    setLoading(false)
  }
}

if (!user) return <div className="text-center py-10">Loading user info...</div>
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Assign Modules to User</h1>
          <Button variant="outline" asChild>
            <Link href="/user-modules">Back</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Select User</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedUserId?.toString() || ""} onValueChange={(v) => setSelectedUserId(Number(v))}>
              <SelectTrigger>
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent>
                {users.map((u) => (
                  <SelectItem key={u.UserId} value={u.UserId.toString()}>
                    {u.UserName} ({u.UserEmail})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Modules</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Loading...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {modules.map((m) => (
                  <div key={m.ModuleId} className="flex items-center space-x-2">
                  <Checkbox
  id={`module-${m.ModuleId}`}
  checked={assignedModules.includes(m.ModuleId)}
  onCheckedChange={() => toggleModule(m.ModuleId)}
  disabled={!selectedUserId || loading || !m.isAssignable}
/>
<Label
  htmlFor={`module-${m.ModuleId}`}
  className={`cursor-pointer ${!m.isAssignable ? "text-gray-400" : ""}`}
>
  {m.ModuleName} ({m.ModuleCode})
</Label>
                  </div>
                ))}
              </div>
            )}
            <p className="text-sm text-muted-foreground mt-2">
              Selected: {assignedModules.length} module(s) {selectedUserId && `for user ${selectedUserId}`}
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
