"use client"

import { useState, useEffect } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "react-toastify"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"

interface Module {
  ModuleId: number
  ModuleName: string
  ModuleCode: string
}

interface Organization {
  OrgCode: number
  OrgName: string
}

interface AssignedModule {
  ModuleId: number
  ModuleCode: string
  ModuleName: string
  OrgCode: number
  Status: string
  IsDeleted: boolean
  TransDate: string
  TransBy: string
  TranDateUpdate: string | null
  TranByUpdate: string | null
  TranDateDel: string | null
  TranByDel: string | null
  OrgName: string
}

interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export default function AddModulePage() {
  const router = useRouter()
  const [modules, setModules] = useState<Module[]>([])
  const [selectedModules, setSelectedModules] = useState<number[]>([])
  const [selectedOrganization, setSelectedOrganization] = useState<number | null>(null)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchModules()
    fetchOrganizations()
  }, [])

  useEffect(() => {
    if (selectedOrganization) {
      fetchAssignedModules(selectedOrganization)
    } else {
      setSelectedModules([])
    }
  }, [selectedOrganization])

  const fetchModules = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("https://api.smartcorpweb.com/api/assignmodules/modules")
      const data: ApiResponse<Module[]> = await response.json()
      
      if (data.success && data.data) {
        setModules(data.data)
      } else {
        toast.error(data.message || "Failed to load modules")
      }
    } catch (error) {
      console.error("Error fetching modules:", error)
      toast.error("Failed to load modules")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchOrganizations = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("https://api.smartcorpweb.com/api/assignmodules/orgs")
      const data: ApiResponse<Organization[]> = await response.json()
      
      if (data.success && data.data) {
        setOrganizations(data.data)
      } else {
        toast.error(data.message || "Failed to load organizations")
      }
    } catch (error) {
      console.error("Error fetching organizations:", error)
      toast.error("Failed to load organizations")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAssignedModules = async (orgCode: number) => {
    try {
      setIsLoading(true)
      const response = await fetch(`https://api.smartcorpweb.com/api/assignmodules/org-modules/org/${orgCode}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data: ApiResponse<AssignedModule[]> = await response.json()
      
      if (data.success && Array.isArray(data.data)) {
        // Extract ModuleId from each assigned module
        const assignedModuleIds = data.data.map((module: AssignedModule) => module.ModuleId)
        setSelectedModules(assignedModuleIds)
      } else {
        setSelectedModules([])
        if (data.message) {
          console.warn("No assigned modules found:", data.message)
        }
      }
    } catch (error) {
      console.error("Error fetching assigned modules:", error)
      // If it's a 404, it means no modules are assigned yet (which is fine)
      if (error instanceof Error && error.message.includes('404')) {
        setSelectedModules([])
        console.log("No modules assigned to this organization yet")
      } else {
        toast.error("Failed to load assigned modules")
        setSelectedModules([])
      }
    } finally {
      setIsLoading(false)
    }
  }

  const toggleModule = async (moduleId: number) => {
    if (!selectedOrganization) {
      toast.error("Please select an organization first")
      return
    }

    const isCurrentlyAssigned = selectedModules.includes(moduleId)
    const module = modules.find((m) => m.ModuleId === moduleId)

    if (!module) {
      toast.error("Module not found")
      return
    }

    try {
      setIsLoading(true)

      if (isCurrentlyAssigned) {
        // Unassign module
        const response = await fetch(
          `https://api.smartcorpweb.com/api/assignmodules/org-modules/${selectedOrganization}/${moduleId}`,
          { 
            method: "DELETE", 
            headers: { "Content-Type": "application/json" } 
          }
        )

        const result: ApiResponse<any> = await response.json()
        
        if (result.success) {
          setSelectedModules(prev => prev.filter(id => id !== moduleId))
          toast.success("Module unassigned successfully")
        } else {
          toast.error(result.message || "Failed to unassign module")
          // Revert UI state on error
          await fetchAssignedModules(selectedOrganization)
        }
      } else {
        // Assign module
        const response = await fetch("https://api.smartcorpweb.com/api/assignmodules/org-modules", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            OrgCode: selectedOrganization,
            ModuleId: moduleId,
            ModuleCode: module.ModuleCode,
            Status: "Active",
            TransBy: "System",
          }),
        })

        const result: ApiResponse<any> = await response.json()
        
        if (result.success) {
          setSelectedModules(prev => [...prev, moduleId])
          toast.success("Module assigned successfully")
        } else {
          toast.error(result.message || "Failed to assign module")
          // Revert UI state on error
          await fetchAssignedModules(selectedOrganization)
        }
      }
    } catch (error) {
      console.error("Error toggling module:", error)
      toast.error("Network error. Please try again.")
      // Revert UI state on error
      await fetchAssignedModules(selectedOrganization)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOrganizationChange = (value: string) => {
    const orgCode = value ? Number.parseInt(value) : null
    setSelectedOrganization(orgCode)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Assign Modules</h1>
          <Button variant="outline" asChild>
            <Link href="/org/modules">Back to Modules</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Assign Modules to Organization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Organization dropdown */}
              <div className="space-y-2">
                <Label htmlFor="organization">Organization *</Label>
                <Select
                  value={selectedOrganization?.toString() || ""}
                  onValueChange={handleOrganizationChange}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select organization" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizations.map((org) => (
                      <SelectItem key={org.OrgCode} value={org.OrgCode.toString()}>
                        {org.OrgCode} - {org.OrgName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Modules selection */}
              <div>
                <Label>Select Modules *</Label>
                {isLoading ? (
                  <div className="text-center py-4">Loading modules...</div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-3 p-4 border rounded-lg">
                      {modules.map((module) => (
                        <div key={module.ModuleId} className="flex items-center space-x-2">
                          <Checkbox
                            id={`module-${module.ModuleId}`}
                            checked={selectedModules.includes(module.ModuleId)}
                            onCheckedChange={() => toggleModule(module.ModuleId)}
                            disabled={!selectedOrganization || isLoading}
                          />
                          <Label
                            htmlFor={`module-${module.ModuleId}`}
                            className="text-sm font-medium cursor-pointer"
                          >
                            {module.ModuleName} ({module.ModuleCode})
                          </Label>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Selected: {selectedModules.length} module(s)
                      {selectedOrganization && ` for organization ${selectedOrganization}`}
                    </p>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}