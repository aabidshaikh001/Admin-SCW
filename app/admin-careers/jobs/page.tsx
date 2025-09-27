"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Search, Filter, Plus, Edit, Trash2, MapPin, Building, FileText } from "lucide-react"
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

interface Job {
  id: number
  OrgCode: number
  title: string
  department: string
  location: string
  type: string
  description: string
  responsibilities: string
  requirements: string
  benefits: string
  createdAt?: string
}

export default function JobsPage() {
      const { user } = useAuth()
  const [jobs, setJobs] = useState<Job[]>([])
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("All")
  const [typeFilter, setTypeFilter] = useState("All")
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  // Get unique departments and types for filters
  const departments = Array.from(new Set(jobs.map((job) => job.department))).filter(Boolean)
  const jobTypes = Array.from(new Set(jobs.map((job) => job.type))).filter(Boolean)

  useEffect(() => {
    fetchJobs()
  }, [])

  useEffect(() => {
    filterJobs()
  }, [searchTerm, departmentFilter, typeFilter, jobs])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      // Replace with your actual OrgCode
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
      setLoading(false)
    }
  }

  const filterJobs = () => {
    let filtered = jobs

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply department filter
    if (departmentFilter !== "All") {
      filtered = filtered.filter((job) => job.department === departmentFilter)
    }

    // Apply type filter
    if (typeFilter !== "All") {
      filtered = filtered.filter((job) => job.type === typeFilter)
    }

    setFilteredJobs(filtered)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this job?")) return

    try {
      // Add delete API call when available
      toast({
        title: "Success",
        description: "Job deleted successfully",
      })
      fetchJobs()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete job",
        variant: "destructive",
      })
    }
  }

  const getJobTypeBadge = (type: string) => {
    const colors = {
      "Full-time": "bg-green-100 text-green-800 border-green-300",
      "Part-time": "bg-blue-100 text-blue-800 border-blue-300",
      Contract: "bg-orange-100 text-orange-800 border-orange-300",
      Internship: "bg-purple-100 text-purple-800 border-purple-300",
    }
    return (
      <Badge
        variant="outline"
        className={colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-300"}
      >
        {type}
      </Badge>
    )
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
            <h1 className="text-2xl font-bold text-foreground">Job Management</h1>
          
          </div>
           <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
          <Link href="/admin-careers/jobs/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
             Add
            </Button>
          </Link>
        </motion.div>

        {/* Filters */}
     

        {/* Jobs Table */}
        <Card>
         
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
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground">No jobs found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchTerm || departmentFilter !== "All" || typeFilter !== "All"
                    ? "Try adjusting your search or filters"
                    : "Create your first job posting"}
                </p>
                <Link href="/admin-careers/jobs/create">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Job
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job Title</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredJobs.map((job) => (
                      <motion.tr
                        key={job.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="group hover:bg-muted/50"
                      >
                        <TableCell>
                          <div className="font-medium">{job.title}</div>
                          <div className="text-sm text-muted-foreground">ID: {job.id}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Building className="w-4 h-4 mr-2 text-muted-foreground" />
                            {job.department}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                            {job.location}
                          </div>
                        </TableCell>
                        <TableCell>{getJobTypeBadge(job.type)}</TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate text-sm text-muted-foreground">{job.description}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Link href={`/admin-careers/jobs/edit/${job.id}`}>
                              <Button variant="outline" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </Link>
                            {/* <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(job.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button> */}
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
