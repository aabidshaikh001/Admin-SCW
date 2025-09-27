"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Paperclip, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { DashboardLayout } from "@/components/dashboard-layout"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"

export default function AddTicketPage() {
  const [formData, setFormData] = useState({
    queryDesc: "",
    email: "",
  })
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.queryDesc.trim()) {
      toast({
        title: "Error",
        description: "Please enter a description for your ticket",
        variant: "destructive",
      })
      return
    }

    if (!user?.OrgCode) {
      toast({
        title: "Error",
        description: "Organization code is required to create a ticket",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      
      const submitData = new FormData()
      submitData.append("OrgCode", user.OrgCode.toString())
      submitData.append("Email", formData.email || user.email || "")
      submitData.append("QueryDesc", formData.queryDesc)
      submitData.append("TransBy", user.name || user.email || "User")
      
      if (file) {
        submitData.append("QueryFile", file)
      }

      const response = await fetch("https://api.smartcorpweb.com/api/queries", {
        method: "POST",
        body: submitData,
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: "Ticket created successfully! You will receive a confirmation email shortly.",
        })
        
        // Reset form
        setFormData({ queryDesc: "", email: "" })
        setFile(null)
        
        // Redirect to tickets list
        window.location.href = "/admin-reports"
      } else {
        throw new Error(result.message || "Failed to create ticket")
      }
    } catch (error) {
      console.error("Error creating ticket:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create ticket",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null
    setFile(selectedFile)
  }

  if (!user?.OrgCode) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-muted-foreground mb-2">
              Organization Code Required
            </h2>
            <p className="text-muted-foreground">
              Please contact administrator to assign an organization code to your account.
            </p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <Link href="/admin-reports">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Tickets
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Create New Support Ticket</h1>
            <p className="text-sm text-muted-foreground">
              Organization: <span className="font-mono font-medium">{user.OrgCode}</span>
            </p>
          </div>
        </motion.div>

        {/* Create Ticket Form */}
        <Card>
          <CardHeader>
            <CardTitle>Ticket Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Contact Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email for updates"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="max-w-md"
                />
                <p className="text-sm text-muted-foreground">
                  {user.email && `Logged in as: ${user.email}. Leave blank to use this email.`}
                </p>
              </div>

              {/* Description Field */}
              <div className="space-y-2">
                <Label htmlFor="queryDesc">Issue Description *</Label>
                <Textarea
                  id="queryDesc"
                  placeholder="Please describe your issue in detail. Include any error messages, steps to reproduce, and what you were trying to accomplish."
                  value={formData.queryDesc}
                  onChange={(e) => setFormData({ ...formData, queryDesc: e.target.value })}
                  rows={8}
                  className="resize-none"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Provide as much detail as possible to help us resolve your issue quickly.
                </p>
              </div>

              {/* File Attachment */}
              <div className="space-y-2">
                <Label htmlFor="file">Attachment (Optional)</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="file"
                    type="file"
                    onChange={handleFileChange}
                    className="max-w-md"
                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.txt"
                  />
                  {file && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Paperclip className="w-4 h-4" />
                      <span>{file.name}</span>
                      <span className="text-xs">({(file.size / 1024).toFixed(1)} KB)</span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Supported formats: images, PDF, Word documents, text files (Max: 10MB)
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={loading} className="min-w-[150px]">
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Create Ticket
                    </>
                  )}
                </Button>
                <Link href="/admin-reports">
                  <Button variant="outline" type="button" disabled={loading}>
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Help Information */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Before Submitting Your Ticket</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Check if your issue has already been resolved in existing tickets</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Include specific error messages and steps to reproduce the issue</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Attach relevant screenshots or documents that might help</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>You will receive a confirmation email with your ticket ID</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}