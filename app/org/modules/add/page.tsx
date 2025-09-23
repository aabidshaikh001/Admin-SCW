"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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

export default function AddModulePage() {
  const router = useRouter()
  const [modules, setModules] = useState<Module[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    ModuleId: "",
    OrgCode: "",
    ModuleCode: "",
    Status: "Active",
    TransBy: "Admin",
  })

  useEffect(() => {
    fetchModules()
    fetchOrganizations()
  }, [])

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
      const response = await fetch("https://api.smartcorpweb.com/api/assignmodules/org-modules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ModuleId: Number.parseInt(formData.ModuleId),
          OrgCode: Number.parseInt(formData.OrgCode),
          ModuleCode: formData.ModuleCode,
          Status: formData.Status,
          TransBy: "System",
        }),
      })

      const data = await response.json()
      if (data.success) {
     toast.success("Module assigned successfully");
        router.push("/org/modules")
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      console.error("Error assigning module:", error)
     toast.error("Failed to assign module");
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
        
          <div>
            <h1 className="text-2xl font-bold text-balance">Module Assignment(New)</h1>
         
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
                  placeholder="Module code will be auto-filled"
                  readOnly
                  className="bg-muted"
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

                {/* <div className="space-y-2">
                  <Label htmlFor="transBy">Assigned By</Label>
                  <Input
                    id="transBy"
                    value={formData.TransBy}
                    onChange={(e) => setFormData((prev) => ({ ...prev, TransBy: e.target.value }))}
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
                  {loading ? "Assigning..." : "Assign Module"}
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
