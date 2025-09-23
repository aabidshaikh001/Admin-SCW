"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "react-toastify"
import { orgLicenseApi } from "@/lib/api"
import { DashboardLayout } from "@/components/dashboard-layout"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"

export default function EditLicensePage() {
  const [formData, setFormData] = useState({
    LicenseName: "",
    OrgCode: "",
    MaxUsers: "",
    MaxVisitors: "",
    Status: "Active",
  })
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [orgs, setOrgs] = useState<any[]>([])
  const router = useRouter()
  const params = useParams()
  const licenseId = params.id as string

  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetching(true)
        // Fetch organizations
        const orgsRes = await fetch("https://api.smartcorpweb.com/api/orgs")
        const orgsData = await orgsRes.json()
        setOrgs(orgsData)

        // Fetch license data
        const licenseRes = await orgLicenseApi.getById(licenseId)
        const licenseData = licenseRes.data || licenseRes
        
        setFormData({
          LicenseName: licenseData.LicenseName || "",
          OrgCode: licenseData.OrgCode?.toString() || "",
          MaxUsers: licenseData.MaxUsers?.toString() || "",
          MaxVisitors: licenseData.MaxVisitors?.toString() || "",
          Status: licenseData.Status || "Active",
        })
      } catch (error) {
        toast.error("Failed to load license data")
        console.error("Failed to load data", error)
      } finally {
        setFetching(false)
      }
    }

    if (licenseId) {
      fetchData()
    }
  }, [licenseId])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.LicenseName || !formData.OrgCode || !formData.MaxUsers || !formData.MaxVisitors) {
      toast.error("Please fill in all required fields")
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

      await orgLicenseApi.update(licenseId, licenseData)
      toast.success("License updated successfully")
      router.push("/org/license")
    } catch (error) {
      toast.error(error?.message || "Failed to update license")
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
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
          <div>
            <h1 className="text-3xl font-bold text-foreground">License (Edit)</h1>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="max-w-2xl">
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* License Name (Static Dropdown) */}
                  <div className="space-y-2">
                    <Label htmlFor="licenseName">License Name *</Label>
                    <Select
                      value={formData.LicenseName}
                      onValueChange={(value) => handleInputChange("LicenseName", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select license name" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Basic">Basic</SelectItem>
                        <SelectItem value="Standard">Standard</SelectItem>
                        <SelectItem value="Premium">Premium</SelectItem>
                        <SelectItem value="Enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Org Dropdown */}
                  <div className="space-y-2">
                    <Label htmlFor="orgCode">Organization *</Label>
                    <Select
                      value={formData.OrgCode}
                      onValueChange={(value) => handleInputChange("OrgCode", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select organization" />
                      </SelectTrigger>
                      <SelectContent>
                        {orgs.map((org) => (
                          <SelectItem key={org.OrgCode} value={org.OrgCode.toString()}>
                            {org.OrgName} ({org.OrgCode})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Max Users */}
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

                  {/* Max Visitors */}
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

                  {/* Status */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.Status}
                      onValueChange={(value) => handleInputChange("Status", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                  <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90">
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Update
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