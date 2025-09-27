"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, User, FileText, Upload } from "lucide-react"
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
interface ApplicationFormData {
  OrgCode: number
  name: string
  email: string
  phone: string
  resume: File | null   // <-- File instead of string
  coverLetter: string
  jobTitle: string
}

interface Job {
  id: number
  title: string
}

export default function CreateApplicationPage() {
    const { user } = useAuth()
  const [formData, setFormData] = useState<ApplicationFormData>({
    OrgCode: user?.OrgCode || 1,
    name: "",
    email: "",
    phone: "",
   resume: null,   // <-- updated
    coverLetter: "",
    jobTitle: "",
  })
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(false)
  const [jobsLoading, setJobsLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      setJobsLoading(true)
      const response = await fetch(`https://api.smartcorpweb.com/api/jobs/jd?OrgCode=${user?.OrgCode || 1}`)
      const data = await response.json()
      setJobs(data || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch jobs",
        variant: "destructive",
      })
    } finally {
      setJobsLoading(false)
    }
  }

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  if (!formData.name || !formData.email || !formData.phone || !formData.resume) {
    toast({
      title: "Error",
      description: "Please fill in all required fields",
      variant: "destructive",
    })
    return
  }

  try {
    setLoading(true)
    const data = new FormData()
    data.append("OrgCode", formData.OrgCode.toString())
    data.append("name", formData.name)
    data.append("email", formData.email)
    data.append("phone", formData.phone)
    data.append("coverLetter", formData.coverLetter)
    data.append("jobTitle", formData.jobTitle)
    if (formData.resume) {
      data.append("resume", formData.resume)
    }

    const response = await fetch("https://api.smartcorpweb.com/api/jobs/application", {
      method: "POST",
      body: data, // <-- no JSON.stringify, no headers
    })

    if (response.ok) {
      toast({
        title: "Success",
        description: "Application submitted successfully",
      })
      router.push("/admin-careers/job-applications")
    } else {
      throw new Error("Failed to submit application")
    }
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to submit application",
      variant: "destructive",
    })
  } finally {
    setLoading(false)
  }
}


const handleInputChange = (field: keyof ApplicationFormData, value: any) => {
  setFormData((prev) => ({ ...prev, [field]: value }))
}


  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
         
          <div>
            <h1 className="text-2xl font-bold text-foreground">Submit Application</h1>
           
          </div>
        </motion.div>

        {/* Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="Enter phone number"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">Job Position</Label>
                    {jobsLoading ? (
                      <div className="h-10 bg-muted rounded animate-pulse"></div>
                    ) : (
                      <Select value={formData.jobTitle} onValueChange={(value) => handleInputChange("jobTitle", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select job position" />
                        </SelectTrigger>
                        <SelectContent>
                          {jobs.map((job) => (
                            <SelectItem key={job.id} value={job.title}>
                              {job.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Application Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
               <div className="space-y-2">
  <Label htmlFor="resume">Resume/CV *</Label>
  <Input
    id="resume"
    type="file"
    accept=".pdf,.doc,.docx"
    onChange={(e) => handleInputChange("resume", e.target.files ? e.target.files[0] : null)}
    required
  />
  <p className="text-xs text-muted-foreground">Upload PDF, DOC, or DOCX file</p>
</div>

                <div className="space-y-2">
                  <Label htmlFor="coverLetter">Cover Letter</Label>
                  <Textarea
                    id="coverLetter"
                    value={formData.coverLetter}
                    onChange={(e) => handleInputChange("coverLetter", e.target.value)}
                    placeholder="Write your cover letter here..."
                    rows={6}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
              <Link href="/admin-careers/job-applications">
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Upload className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Submit Application
                  </>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
