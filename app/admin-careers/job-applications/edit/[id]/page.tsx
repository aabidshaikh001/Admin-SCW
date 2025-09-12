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
  resume: File | string | null   // <-- File (new) OR string (old)

  coverLetter: string
  jobTitle: string
}

interface Job {
  id: number
  title: string
}

export default function EditApplicationPage({ params }: { params: { id: string } }) {
    const { user } = useAuth()
  const [formData, setFormData] = useState<ApplicationFormData>({
    OrgCode: user?.OrgCode || 1,
    name: "",
    email: "",
    phone: "",
   resume: null,   // <-- initially null
    coverLetter: "",
    jobTitle: "",
  })
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [jobsLoading, setJobsLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchApplication()
    fetchJobs()
  }, [params.id])

  const fetchApplication = async () => {
    try {
      setFetchLoading(true)
      const response = await fetch(`https://api.smartcorpweb.com/api/jobs/application/${params.id}?OrgCode=${user?.OrgCode}`)
      const data = await response.json()

      if (data) {
        setFormData({
          OrgCode: data.OrgCode,
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          resume: data.resume || "",
          coverLetter: data.coverLetter || "",
          jobTitle: data.jobTitle || "",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch application details",
        variant: "destructive",
      })
    } finally {
      setFetchLoading(false)
    }
  }

  const fetchJobs = async () => {
    try {
      setJobsLoading(true)
      const response = await fetch(`https://api.smartcorpweb.com/api/jobs/jd?OrgCode=${user?.OrgCode}`)
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

  if (!formData.name || !formData.email || !formData.phone) {
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

    // Append resume if it's a new file
    if (formData.resume instanceof File) {
      data.append("resume", formData.resume)
    }

    const response = await fetch(
      `https://api.smartcorpweb.com/api/jobs/application/${params.id}?OrgCode=${user?.OrgCode}`,
      {
        method: "PUT",   // <-- assuming you’ll add an update route
        body: data,
      }
    )

    if (response.ok) {
      toast({
        title: "Success",
        description: "Application updated successfully",
      })
      router.push("/admin-careers/job-applications")
    } else {
      throw new Error("Failed to update application")
    }
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to update application",
      variant: "destructive",
    })
  } finally {
    setLoading(false)
  }
}


  const handleInputChange = (field: keyof ApplicationFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (fetchLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-10 bg-muted rounded w-32 animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-8 bg-muted rounded w-48 animate-pulse"></div>
              <div className="h-4 bg-muted rounded w-32 animate-pulse"></div>
            </div>
          </div>
          <Card>
            <CardHeader>
              <div className="h-6 bg-muted rounded w-40 animate-pulse"></div>
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-10 bg-muted rounded animate-pulse"></div>
              ))}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
          <Link href="/admin-careers/job-applications">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Applications
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Edit Application</h1>
            <p className="text-muted-foreground">Update application details</p>
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
  <Label htmlFor="resume">Resume/CV</Label>

  {/* If resume is a string, show link */}
  {typeof formData.resume === "string" && formData.resume && (
    <div className="text-sm">
      <a
        href={`https://api.smartcorpweb.com/uploads/resumes/${formData.resume}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline"
      >
        View Current Resume
      </a>
    </div>
  )}

  {/* Upload new file */}
  <Input
    id="resume"
    type="file"
    accept=".pdf,.doc,.docx"
    onChange={(e) =>
      setFormData((prev) => ({
        ...prev,
        resume: e.target.files ? e.target.files[0] : prev.resume,
      }))
    }
  />
  <p className="text-xs text-muted-foreground">
    Upload a new resume (optional). Leave blank to keep current one.
  </p>
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
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Update Application
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
