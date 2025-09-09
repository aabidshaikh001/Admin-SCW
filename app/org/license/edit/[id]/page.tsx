"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { orgLicenseApi } from "@/lib/api"
import {DashboardLayout} from "@/components/dashboard-layout"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface EditLicensePageProps {
  params: {
    id: string
  }
}

export default function EditLicensePage({ params }: EditLicensePageProps) {
  const [formData, setFormData] = useState({
    LicenseName: "",
    OrgCode: "",
    MaxUsers: "",
    MaxVisitors: "",
    Status: "Active",
  })
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchLicense()
  }, [params.id])

  const fetchLicense = async () => {
    try {
      setInitialLoading(true)
      const license = await orgLicenseApi.getById(params.id)
      setFormData({
        LicenseName: license.LicenseName || "",
        OrgCode: license.OrgCode?.toString() || "",
        MaxUsers: license.MaxUsers?.toString() || "",
        MaxVisitors: license.MaxVisitors?.toString() || "",
        Status: license.Status || "Active",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch license details",
        variant: "destructive",
      })
    } finally {
      setInitialLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.LicenseName || !formData.OrgCode || !formData.MaxUsers || !formData.MaxVisitors) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      const licenseData = {
        ...formData,
        OrgCode: Number.parseInt(formData.OrgCode),
        MaxUsers: Number.parseInt(formData.MaxUsers),
        MaxVisitors: Number.parseInt(formData.MaxVisitors),
      }

      await orgLicenseApi.update(params.id, licenseData)
      toast({
        title: "Success",
        description: "License updated successfully",
      })
      router.push("/org/license")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update license",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
          <Link href="/org/license">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Edit License</h1>
            <p className="text-muted-foreground">Update license information</p>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>License Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="licenseName">License Name *</Label>
                    <Input
                      id="licenseName"
                      value={formData.LicenseName}
                      onChange={(e) => handleInputChange("LicenseName", e.target.value)}
                      placeholder="Enter license name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="orgCode">Organization Code *</Label>
                    <Input
                      id="orgCode"
                      type="number"
                      value={formData.OrgCode}
                      onChange={(e) => handleInputChange("OrgCode", e.target.value)}
                      placeholder="Enter organization code"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxUsers">Max Users *</Label>
                    <Input
                      id="maxUsers"
                      type="number"
                      value={formData.MaxUsers}
                      onChange={(e) => handleInputChange("MaxUsers", e.target.value)}
                      placeholder="Enter maximum users"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxVisitors">Max Visitors *</Label>
                    <Input
                      id="maxVisitors"
                      type="number"
                      value={formData.MaxVisitors}
                      onChange={(e) => handleInputChange("MaxVisitors", e.target.value)}
                      placeholder="Enter maximum visitors"
                      required
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.Status} onValueChange={(value) => handleInputChange("Status", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                        <SelectItem value="Expired">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90">
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Update License
                  </Button>
                  <Link href="/org/license">
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
