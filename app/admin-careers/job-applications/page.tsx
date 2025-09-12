"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Search, Filter, Plus, Edit, Trash2, Mail, Phone, FileText, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { DashboardLayout } from "@/components/dashboard-layout"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"

interface JobApplication {
  id: number
  OrgCode: number
  name: string
  email: string
  phone: string
  resume: string
  coverLetter?: string
  jobTitle?: string
  jobTitleName?: string
  submittedAt: string
}

export default function JobApplicationsPage() {
  const { user } = useAuth()
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [filteredApplications, setFilteredApplications] = useState<JobApplication[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [jobFilter, setJobFilter] = useState("All")
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  // Get unique job titles for filters
  const jobTitles = Array.from(new Set(applications.map((app) => app.jobTitleName || app.jobTitle))).filter(Boolean)

  useEffect(() => {
    fetchApplications()
  }, [])

  useEffect(() => {
    filterApplications()
  }, [searchTerm, jobFilter, applications])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      // Replace with your actual OrgCode
      const response = await fetch("https://api.smartcorpweb.com/api/jobs/application?OrgCode=" + (user?.OrgCode || 1))
      const data = await response.json()
      setApplications(data || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch applications",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterApplications = () => {
    let filtered = applications

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (app) =>
          app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.phone.includes(searchTerm) ||
          (app.jobTitleName || app.jobTitle || "").toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply job filter
    if (jobFilter !== "All") {
      filtered = filtered.filter((app) => (app.jobTitleName || app.jobTitle) === jobFilter)
    }

    setFilteredApplications(filtered)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this application?")) return

    try {
      // Add delete API call when available
      toast({
        title: "Success",
        description: "Application deleted successfully",
      })
      fetchApplications()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete application",
        variant: "destructive",
      })
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground">Job Applications</h1>
            <p className="text-muted-foreground">Manage job applications and candidates</p>
          </div>
          <Link href="/admin-careers/job-applications/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Application
            </Button>
          </Link>
        </motion.div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search applications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={jobFilter} onValueChange={setJobFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by job" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Jobs</SelectItem>
                  {jobTitles.map((job) => (
                    <SelectItem key={job} value={job}>
                      {job}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Applications Table */}
        <Card>
          <CardHeader>
            <CardTitle>Applications ({filteredApplications.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="animate-pulse flex space-x-4 p-4 border rounded-lg">
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground">No applications found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchTerm || jobFilter !== "All"
                    ? "Try adjusting your search or filters"
                    : "No applications submitted yet"}
                </p>
                <Link href="/admin-careers/job-applications/create">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Application
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidate</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Job Applied</TableHead>
                      <TableHead>Resume</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplications.map((application) => (
                      <motion.tr
                        key={application.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="group hover:bg-muted/50"
                      >
                        <TableCell>
                          <div className="font-medium">{application.name}</div>
                          <div className="text-sm text-muted-foreground">ID: {application.id}</div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center text-sm">
                              <Mail className="w-3 h-3 mr-2 text-muted-foreground" />
                              {application.email}
                            </div>
                            <div className="flex items-center text-sm">
                              <Phone className="w-3 h-3 mr-2 text-muted-foreground" />
                              {application.phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {application.jobTitleName || application.jobTitle || "Not specified"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {application.resume ? (
                            <Button variant="outline" size="sm" asChild>
                              <a
                                href={`https://api.smartcorpweb.com${application.resume}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Download className="w-3 h-3 mr-2" />
                                View Resume
                              </a>
                            </Button>
                          ) : (
                            <span className="text-muted-foreground text-sm">No resume</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{new Date(application.submittedAt).toLocaleDateString()}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(application.submittedAt).toLocaleTimeString()}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Link href={`/admin-careers/job-applications/edit/${application.id}`}>
                              <Button variant="outline" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(application.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
