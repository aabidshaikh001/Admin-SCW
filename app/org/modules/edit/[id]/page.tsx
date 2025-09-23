"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from 'react-toastify';
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import {DashboardLayout} from "@/components/dashboard-layout"

interface Module {
  ModuleId: number
  ModuleName: string
  ModuleCode: string
}

interface Organization {
  OrgCode: number
  OrgName: string
}

interface OrgModule {
  OrgModuleId: number
  ModuleId: number
  OrgCode: number
  ModuleCode: string
  Status: string
  ModuleName: string
  OrgName: string
  TransBy: string
}

export default function EditModulePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [modules, setModules] = useState<Module[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [orgModule, setOrgModule] = useState<OrgModule | null>(null)
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [formData, setFormData] = useState({
    ModuleId: "",
    OrgCode: "",
    ModuleCode: "",
    Status: "Active",
    TranByUpdate: "Admin",
  })

  useEffect(() => {
    if (id) {
      fetchOrgModule()
      fetchModules()
      fetchOrganizations()
    }
  }, [id])

  const fetchOrgModule = async () => {
  try {
    const response = await fetch(`https://api.smartcorpweb.com/api/assignmodules/org-modules/${id}`)
    const data = await response.json()
    if (data.success && data.data.length > 0) {
      const module = data.data[0] // since backend returns array
      setOrgModule(module)
      setFormData({
        ModuleId: module.ModuleId.toString(),
        OrgCode: module.OrgCode.toString(),
        ModuleCode: module.ModuleCode,
        Status: module.Status,
        TranByUpdate: "Admin",
      })
    }
  } catch (error) {
    console.error("Error fetching org module:", error)
  } finally {
    setPageLoading(false)
  }
}

  const fetchModules = async () => {
    try {
      const response = await fetch("https://api.smartcorpweb.com/api/assignmodules/modules")
      const data = await response.json()
      if (data.success) {
        setModules(data.data)
      }
    } catch (error) {
      console.error("Error fetching modules:", error)
    }
  }

  const fetchOrganizations = async () => {
    try {
      const response = await fetch("https://api.smartcorpweb.com/api/assignmodules/orgs")
      const data = await response.json()
      if (data.success) {
        setOrganizations(data.data)
      }
    } catch (error) {
      console.error("Error fetching organizations:", error)
    }
  }

  const handleModuleChange = (moduleId: string) => {
    const selectedModule = modules.find((m) => m.ModuleId.toString() === moduleId)
    setFormData((prev) => ({
      ...prev,
      ModuleId: moduleId,
      ModuleCode: selectedModule?.ModuleCode || "",
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.ModuleId || !formData.OrgCode) {
      toast.error("Please select both module and organization");
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`https://api.smartcorpweb.com/api/assignmodules/org-modules/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ModuleId: Number.parseInt(formData.ModuleId),
          OrgCode: Number.parseInt(formData.OrgCode),
          ModuleCode: formData.ModuleCode,
          Status: formData.Status,
          TranByUpdate: "System",
        }),
      })

      const data = await response.json()
      if (data.success) {
      
        toast.success("Module assignment updated successfully");
        router.push("/org/modules")
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      console.error("Error updating module:", error)
   
      toast.error("Failed to update module assignment");
    } finally {
      setLoading(false)
    }
  }

  if (pageLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!orgModule) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold">Module Assignment Not Found</h2>
        
      
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          
          <div>
            <h1 className="text-2xl font-bold text-balance">Module Assignment(Update)</h1>
     
          </div>
        </div>

        <Card className="max-w-2xl">
         
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="module">Module *</Label>
                  <Select value={formData.ModuleId} onValueChange={handleModuleChange} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a module" />
                    </SelectTrigger>
                    <SelectContent>
                      {modules.map((module) => (
                        <SelectItem key={module.ModuleId} value={module.ModuleId.toString()}>
                          {module.ModuleName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organization">Organization *</Label>
                  <Select
                    value={formData.OrgCode}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, OrgCode: value }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an organization" />
                    </SelectTrigger>
                    <SelectContent>
                      {organizations.map((org) => (
                        <SelectItem key={org.OrgCode} value={org.OrgCode.toString()}>
                          {org.OrgName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="moduleCode">Module Code</Label>
                <Input
                  id="moduleCode"
                  value={formData.ModuleCode}
                  onChange={(e) => setFormData((prev) => ({ ...prev, ModuleCode: e.target.value }))}
                   readOnly
                  placeholder="Module code"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
{/* 
                <div className="space-y-2">
                  <Label htmlFor="tranByUpdate">Updated By</Label>
                  <Input
                    id="tranByUpdate"
                    value={formData.TranByUpdate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, TranByUpdate: e.target.value }))}
                    placeholder="Enter your name"
                  />
                </div> */}
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  {loading ? "Updating..." : "Update Assignment"}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/org/modules">Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
