"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, User, Mail, Phone, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { DashboardLayout } from "@/components/dashboard-layout"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"

export default function CreateEnquiryPage() {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    Name: "",
    Email: "",
    Mobile: "",
    Whatsapp: "",
    Message: "",
    TicketSource: "",
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
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
      setLoading(true)
      const response = await fetch("https://api.smartcorpweb.com/api/enquiry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          OrgCode: user?.OrgCode || 1,
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Enquiry created successfully",
        })
        router.push("/admin-cms/enquiries")
      } else {
        throw new Error("Failed to create enquiry")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create enquiry",
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
          <Link href="/admin-cms/enquiries">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Enquiries
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Create New Enquiry</h1>
            <p className="text-muted-foreground">Add a new customer enquiry to the system</p>
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
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="TicketSource">
                      Source <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.TicketSource}
                      onValueChange={(value) => handleSelectChange("TicketSource", value)}
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="Message">
                    Message <span className="text-red-500">*</span>
                  </Label>
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
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <Link href="/admin-cms/enquiries">
                    <Button variant="outline" type="button">
                      Cancel
                    </Button>
                  </Link>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Create Enquiry
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
