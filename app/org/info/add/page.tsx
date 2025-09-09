"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { ArrowLeft, Building2, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { orgApi } from "@/lib/api"
import {DashboardLayout} from "@/components/dashboard-layout"
import Link from "next/link"

export default function AddOrganizationPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    OrgCode: "",
    OrgType: "",
    OrgName: "",
    ContactPerson: "",
    EstYear: "",
    MultiBranch: "",
    AffiliatedTo: "",
    AffiliationNo: "",
    SchoolMoto: "",
    RegistrationNo: "",
    BoardUniversity: "",
    Web: "",
    Address1: "",
    Address2: "",
    Country: "",
    State: "",
    City: "",
    PinNo: "",
    Phone: "",
    Mobile: "",
    Email: "",
    PANNo: "",
    GSTINNo: "",
    ACHolderName: "",
    BankAccount: "",
    BankCode: "",
    BankBranch: "",
    BankIFSC: "",
    SubsType: "",
    SubsFrom: "",
    SubsTo: "",
    AdminEmail: "",
    AdminPwd: "",
    WebAdminEmail: "",
    WebAdminPwd: "",
    WAMsgVisit: "",
    WAMsgBusiness: "",
    Status: "Active",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onload = () => setLogoPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const removeLogo = () => {
    setLogoFile(null)
    setLogoPreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const submitData = new FormData()

      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value) submitData.append(key, value)
      })

      // Add logo file if selected
      if (logoFile) {
        submitData.append("Logo", logoFile)
      }

      await orgApi.create(submitData)

      toast({
        title: "Success",
        description: "Organization created successfully",
      })

      router.push("/org/info")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create organization",
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-4"
        >
          <Link href="/org/info">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Add Organization</h1>
            <p className="text-muted-foreground">Create a new organization in the system</p>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <form onSubmit={handleSubmit}>
            <Tabs defaultValue="basic" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
                <TabsTrigger value="financial">Financial</TabsTrigger>
                <TabsTrigger value="admin">Admin</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="basic">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Building2 className="w-5 h-5 mr-2" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Logo Upload */}
                    <div className="space-y-2">
                      <Label>Organization Logo</Label>
                      <div className="flex items-center space-x-4">
                        {logoPreview ? (
                          <div className="relative">
                            <img
                              src={logoPreview || "/placeholder.svg"}
                              alt="Logo preview"
                              className="w-20 h-20 object-cover rounded-lg border"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute -top-2 -right-2 w-6 h-6 p-0"
                              onClick={removeLogo}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="w-20 h-20 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
                            <Upload className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoChange}
                            className="hidden"
                            id="logo-upload"
                          />
                          <Label htmlFor="logo-upload" className="cursor-pointer">
                            <Button type="button" variant="outline" asChild>
                              <span>Choose Logo</span>
                            </Button>
                          </Label>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="orgCode">Organization Code *</Label>
                        <Input
                          id="orgCode"
                          type="number"
                          value={formData.OrgCode}
                          onChange={(e) => handleInputChange("OrgCode", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="orgName">Organization Name *</Label>
                        <Input
                          id="orgName"
                          value={formData.OrgName}
                          onChange={(e) => handleInputChange("OrgName", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="orgType">Organization Type</Label>
                        <Select value={formData.OrgType} onValueChange={(value) => handleInputChange("OrgType", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="School">School</SelectItem>
                            <SelectItem value="College">College</SelectItem>
                            <SelectItem value="University">University</SelectItem>
                            <SelectItem value="Institute">Institute</SelectItem>
                            <SelectItem value="Corporate">Corporate</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactPerson">Contact Person</Label>
                        <Input
                          id="contactPerson"
                          value={formData.ContactPerson}
                          onChange={(e) => handleInputChange("ContactPerson", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="estYear">Establishment Year</Label>
                        <Input
                          id="estYear"
                          type="number"
                          value={formData.EstYear}
                          onChange={(e) => handleInputChange("EstYear", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="web">Website</Label>
                        <Input
                          id="web"
                          type="url"
                          value={formData.Web}
                          onChange={(e) => handleInputChange("Web", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="schoolMoto">School Motto</Label>
                      <Textarea
                        id="schoolMoto"
                        value={formData.SchoolMoto}
                        onChange={(e) => handleInputChange("SchoolMoto", e.target.value)}
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="contact">
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={formData.Phone}
                          onChange={(e) => handleInputChange("Phone", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="mobile">Mobile</Label>
                        <Input
                          id="mobile"
                          value={formData.Mobile}
                          onChange={(e) => handleInputChange("Mobile", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.Email}
                          onChange={(e) => handleInputChange("Email", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="address1">Address Line 1</Label>
                        <Input
                          id="address1"
                          value={formData.Address1}
                          onChange={(e) => handleInputChange("Address1", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address2">Address Line 2</Label>
                        <Input
                          id="address2"
                          value={formData.Address2}
                          onChange={(e) => handleInputChange("Address2", e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            value={formData.City}
                            onChange={(e) => handleInputChange("City", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state">State</Label>
                          <Input
                            id="state"
                            value={formData.State}
                            onChange={(e) => handleInputChange("State", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="country">Country</Label>
                          <Input
                            id="country"
                            value={formData.Country}
                            onChange={(e) => handleInputChange("Country", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="pinNo">PIN Code</Label>
                          <Input
                            id="pinNo"
                            value={formData.PinNo}
                            onChange={(e) => handleInputChange("PinNo", e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="financial">
                <Card>
                  <CardHeader>
                    <CardTitle>Financial Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="panNo">PAN Number</Label>
                        <Input
                          id="panNo"
                          value={formData.PANNo}
                          onChange={(e) => handleInputChange("PANNo", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gstinNo">GSTIN Number</Label>
                        <Input
                          id="gstinNo"
                          value={formData.GSTINNo}
                          onChange={(e) => handleInputChange("GSTINNo", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="acHolderName">Account Holder Name</Label>
                        <Input
                          id="acHolderName"
                          value={formData.ACHolderName}
                          onChange={(e) => handleInputChange("ACHolderName", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bankAccount">Bank Account</Label>
                        <Input
                          id="bankAccount"
                          value={formData.BankAccount}
                          onChange={(e) => handleInputChange("BankAccount", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bankCode">Bank Code</Label>
                        <Input
                          id="bankCode"
                          value={formData.BankCode}
                          onChange={(e) => handleInputChange("BankCode", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bankBranch">Bank Branch</Label>
                        <Input
                          id="bankBranch"
                          value={formData.BankBranch}
                          onChange={(e) => handleInputChange("BankBranch", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bankIFSC">Bank IFSC</Label>
                        <Input
                          id="bankIFSC"
                          value={formData.BankIFSC}
                          onChange={(e) => handleInputChange("BankIFSC", e.target.value)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="admin">
                <Card>
                  <CardHeader>
                    <CardTitle>Admin Credentials</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="adminEmail">Admin Email</Label>
                        <Input
                          id="adminEmail"
                          type="email"
                          value={formData.AdminEmail}
                          onChange={(e) => handleInputChange("AdminEmail", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="adminPwd">Admin Password</Label>
                        <Input
                          id="adminPwd"
                          type="password"
                          value={formData.AdminPwd}
                          onChange={(e) => handleInputChange("AdminPwd", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="webAdminEmail">Web Admin Email</Label>
                        <Input
                          id="webAdminEmail"
                          type="email"
                          value={formData.WebAdminEmail}
                          onChange={(e) => handleInputChange("WebAdminEmail", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="webAdminPwd">Web Admin Password</Label>
                        <Input
                          id="webAdminPwd"
                          type="password"
                          value={formData.WebAdminPwd}
                          onChange={(e) => handleInputChange("WebAdminPwd", e.target.value)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Additional Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="subsType">Subscription Type</Label>
                        <Select
                          value={formData.SubsType}
                          onValueChange={(value) => handleInputChange("SubsType", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select subscription" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Basic">Basic</SelectItem>
                            <SelectItem value="Premium">Premium</SelectItem>
                            <SelectItem value="Enterprise">Enterprise</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select value={formData.Status} onValueChange={(value) => handleInputChange("Status", value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subsFrom">Subscription From</Label>
                        <Input
                          id="subsFrom"
                          type="date"
                          value={formData.SubsFrom}
                          onChange={(e) => handleInputChange("SubsFrom", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subsTo">Subscription To</Label>
                        <Input
                          id="subsTo"
                          type="date"
                          value={formData.SubsTo}
                          onChange={(e) => handleInputChange("SubsTo", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="waMsgVisit">WhatsApp Visit Message</Label>
                        <Textarea
                          id="waMsgVisit"
                          value={formData.WAMsgVisit}
                          onChange={(e) => handleInputChange("WAMsgVisit", e.target.value)}
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="waMsgBusiness">WhatsApp Business Message</Label>
                        <Textarea
                          id="waMsgBusiness"
                          value={formData.WAMsgBusiness}
                          onChange={(e) => handleInputChange("WAMsgBusiness", e.target.value)}
                          rows={3}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6">
              <Link href="/org/info">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Organization"}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
