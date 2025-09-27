"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Search, Filter, Plus, Edit, Trash2, Phone, Mail, MessageSquare, Calendar, User } from "lucide-react"
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

export default function EnquiriesPage() {
     const { user } = useAuth()
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [filteredEnquiries, setFilteredEnquiries] = useState<Enquiry[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [sourceFilter, setSourceFilter] = useState("All")
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<number | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchEnquiries()
  }, [])

  useEffect(() => {
    filterEnquiries()
  }, [searchTerm, statusFilter, sourceFilter, enquiries])

  const fetchEnquiries = async () => {
    try {
      setLoading(true)
      const response = await fetch("https://api.smartcorpweb.com/api/enquiry?OrgCode=" + (user?.OrgCode || 1))
      const data = await response.json()
      setEnquiries(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch enquiries",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterEnquiries = () => {
    let filtered = enquiries

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (enquiry) =>
          enquiry.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          enquiry.Email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          enquiry.Mobile.includes(searchTerm) ||
          enquiry.Message.toLowerCase().includes(searchTerm.toLowerCase()) ||
          enquiry.TicketSource.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply status filter
    if (statusFilter !== "All") {
      const isActive = statusFilter === "Active"
      filtered = filtered.filter((enquiry) => enquiry.Status === isActive)
    }

    // Apply source filter
    if (sourceFilter !== "All") {
      filtered = filtered.filter((enquiry) => enquiry.TicketSource === sourceFilter)
    }

    setFilteredEnquiries(filtered)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this enquiry?")) return

    try {
      setDeleting(id)
      const response = await fetch(`https://api.smartcorpweb.com/api/enquiry/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ OrgCode: user?.OrgCode || 1 }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Enquiry deleted successfully",
        })
        fetchEnquiries()
      } else {
        throw new Error("Failed to delete enquiry")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete enquiry",
        variant: "destructive",
      })
    } finally {
      setDeleting(null)
    }
  }

  const getStatusBadge = (status: boolean) => {
    return status ? (
      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
        Active
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">
        Inactive
      </Badge>
    )
  }

  const getSourceBadge = (source: string) => {
    const colors = {
      Website: "bg-blue-100 text-blue-800 border-blue-300",
      Phone: "bg-purple-100 text-purple-800 border-purple-300",
      Email: "bg-green-100 text-green-800 border-green-300",
      WhatsApp: "bg-emerald-100 text-emerald-800 border-emerald-300",
    }

    return (
      <Badge
        variant="outline"
        className={colors[source as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-300"}
      >
        {source}
      </Badge>
    )
  }

  const uniqueSources = [...new Set(enquiries.map((e) => e.TicketSource))]

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
            <h1 className="text-2xl font-bold text-foreground">Enquiry Management</h1>
          
          </div>
          <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search enquiries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
          <Link href="/admin-cms/enquiries/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
             New
            </Button>
          </Link>
        </motion.div>

       

        {/* Enquiries Table */}
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
            ) : filteredEnquiries.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground">No enquiries found</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {searchTerm || statusFilter !== "All" || sourceFilter !== "All"
                    ? "Try adjusting your search or filters"
                    : "No enquiries submitted yet"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEnquiries.map((enquiry) => (
                      <motion.tr
                        key={enquiry.Id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="group hover:bg-muted/50"
                      >
                        <TableCell className="font-mono text-sm">#{enquiry.Id}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{enquiry.Name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2 text-sm">
                              <Mail className="w-3 h-3 text-muted-foreground" />
                              <span>{enquiry.Email}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                              <Phone className="w-3 h-3 text-muted-foreground" />
                              <span>{enquiry.Mobile}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getSourceBadge(enquiry.TicketSource)}</TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <p className="text-sm line-clamp-2">{enquiry.Message}</p>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(enquiry.Status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(enquiry.TransDate).toLocaleDateString()}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Link href={`/admin-cms/enquiries/edit/${enquiry.Id}`}>
                              <Button variant="outline" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </Link>
                            {/* <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(enquiry.Id)}
                              disabled={deleting === enquiry.Id}
                              className="text-red-600 hover:text-red-700"
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
