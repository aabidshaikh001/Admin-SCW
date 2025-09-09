"use client"

import type React from "react"

import { useState } from "react"
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

export default function AddLicensePage() {
  const [formData, setFormData] = useState({
    LicenseName: "",
    OrgCode: "",
    MaxUsers: "",
    MaxVisitors: "",
    Status: "Active",
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

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

      await orgLicenseApi.create(licenseData)
      toast({
        title: "Success",
        description: "License created successfully",
      })
      router.push("/org/license")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create license",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
          
          <div>
            <h1 className="text-3xl font-bold text-foreground">License (Add)</h1>
            {/* <p className="text-muted-foreground">Create a new organization license</p> */}
          </div>
        </motion.div>

        {/* Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="max-w-2xl">
            
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
                    Create License
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
