"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, User, Mail, Phone, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { DashboardLayout } from "@/components/dashboard-layout"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"

interface Enquiry {
  Id: number
  OrgCode: string
  Name: string
  Email: string
  Mobile: string
  Whatsapp: string
  Message: string
  TicketSource: string
  Status: boolean
  TransDate: string
}

export default function EditEnquiryPage({ params }: { params: { id: string } }) {
       const { user } = useAuth()
  const [enquiry, setEnquiry] = useState<Enquiry | null>(null)
  const [formData, setFormData] = useState({
    Name: "",
    Email: "",
    Mobile: "",
    Whatsapp: "",
    Message: "",
    TicketSource: "",
    Status: true,
  })
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchEnquiry()
  }, [params.id])

  const fetchEnquiry = async () => {
    try {
      setLoading(true)
      const response = await fetch(`https://api.smartcorpweb.com/api/enquiry/${params.id}?OrgCode=${user?.OrgCode}`)

      if (response.ok) {
        const data = await response.json()
        setEnquiry(data)
        setFormData({
          Name: data.Name || "",
          Email: data.Email || "",
          Mobile: data.Mobile || "",
          Whatsapp: data.Whatsapp || "",
          Message: data.Message || "",
          TicketSource: data.TicketSource || "",
          Status: data.Status || false,
        })
      } else {
        throw new Error("Failed to fetch enquiry")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch enquiry details",
        variant: "destructive",
      })
      router.push("/admin-cms/enquiries")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.Name || !formData.Email || !formData.Message || !formData.TicketSource) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      setUpdating(true)

      // Update status
      const statusResponse = await fetch(`https://api.smartcorpweb.com/api/enquiry/${params.id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          OrgCode: user?.OrgCode || 1,
          Status: formData.Status,
        }),
      })

      if (statusResponse.ok) {
        toast({
          title: "Success",
          description: "Enquiry updated successfully",
        })
        router.push("/admin-cms/enquiries")
      } else {
        throw new Error("Failed to update enquiry")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update enquiry",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-10 bg-muted rounded w-32 animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-8 bg-muted rounded w-64 animate-pulse"></div>
              <div className="h-4 bg-muted rounded w-48 animate-pulse"></div>
            </div>
          </div>
          <Card>
            <CardHeader>
              <div className="h-6 bg-muted rounded w-32 animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
                    <div className="h-10 bg-muted rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  if (!enquiry) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-muted-foreground">Enquiry not found</h3>
          <Link href="/admin-cms/enquiries">
            <Button className="mt-4">Back to Enquiries</Button>
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
          <Link href="/admin-cms/enquiries">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Enquiries
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Edit Enquiry #{enquiry.Id}</h1>
            <p className="text-muted-foreground">Update enquiry details and status</p>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader>
              <CardTitle>Enquiry Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="Name">
                      Name <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="Name"
                        name="Name"
                        value={formData.Name}
                        onChange={handleInputChange}
                        placeholder="Enter customer name"
                        className="pl-10"
                        required
                        disabled
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="Email">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="Email"
                        name="Email"
                        type="email"
                        value={formData.Email}
                        onChange={handleInputChange}
                        placeholder="Enter email address"
                        className="pl-10"
                        required
                        disabled
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="Mobile">Mobile Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="Mobile"
                        name="Mobile"
                        value={formData.Mobile}
                        onChange={handleInputChange}
                        placeholder="Enter mobile number"
                        className="pl-10"
                        disabled
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="Whatsapp">WhatsApp Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="Whatsapp"
                        name="Whatsapp"
                        value={formData.Whatsapp}
                        onChange={handleInputChange}
                        placeholder="Enter WhatsApp number"
                        className="pl-10"
                        disabled
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="TicketSource">Source</Label>
                    <Select
                      value={formData.TicketSource}
                      onValueChange={(value) => handleSelectChange("TicketSource", value)}
                      disabled
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select enquiry source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Website">Website</SelectItem>
                        <SelectItem value="Phone">Phone</SelectItem>
                        <SelectItem value="Email">Email</SelectItem>
                        <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                        <SelectItem value="Social Media">Social Media</SelectItem>
                        <SelectItem value="Referral">Referral</SelectItem>
                        <SelectItem value="Walk-in">Walk-in</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="Status">Status</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="Status"
                        checked={formData.Status}
                        onCheckedChange={(checked) => handleSwitchChange("Status", checked)}
                      />
                      <Label htmlFor="Status" className="text-sm">
                        {formData.Status ? "Active" : "Inactive"}
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="Message">Message</Label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 text-muted-foreground w-4 h-4" />
                    <Textarea
                      id="Message"
                      name="Message"
                      value={formData.Message}
                      onChange={handleInputChange}
                      placeholder="Enter enquiry message or details"
                      rows={4}
                      className="pl-10"
                      disabled
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <Link href="/admin-cms/enquiries">
                    <Button variant="outline" type="button">
                      Cancel
                    </Button>
                  </Link>
                  <Button type="submit" disabled={updating}>
                    {updating ? (
                      <>
                        <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Update Enquiry
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
