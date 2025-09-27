"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Search, Filter, Mail, FileText, Calendar, User, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { DashboardLayout } from "@/components/dashboard-layout"
import Link from "next/link"

interface SMTranQuery {
  QID: number
  OrgCode: string
  Email: string
  QueryDesc: string
  QueryFile: string
  SysAdmDesc: string
  Status: "Open" | "In Progress" | "Closed"
  TransBy: string
  
  TransDate: string
  TranUpdate: string
  TranByUpdate: string
}

export default function SATicketsPage() {
  const [queries, setQueries] = useState<SMTranQuery[]>([])
  const [filteredQueries, setFilteredQueries] = useState<SMTranQuery[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchQueries()
  }, [])

 useEffect(() => {
  const normalizedSearch = searchTerm.trim().toLowerCase()
  let filtered = queries

  if (normalizedSearch) {
    filtered = filtered.filter((query) =>
      query.QID.toString().includes(normalizedSearch) ||
      (query.Email ?? "").toLowerCase().includes(normalizedSearch) ||
      (query.QueryDesc ?? "").toLowerCase().includes(normalizedSearch) ||
      (query.OrgCode?.toString() ?? "").toLowerCase().includes(normalizedSearch)
    )
  }

  if (statusFilter !== "All") {
    filtered = filtered.filter((query) => query.Status === statusFilter)
  }

  setFilteredQueries(filtered)
}, [searchTerm, statusFilter, queries])


  const fetchQueries = async () => {
    try {
      setLoading(true)
      // Replace with your API call
      const response = await fetch("https://api.smartcorpweb.com/api/queries")
      const data = await response.json()
      if (data.success) {
        setQueries(data.data)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch queries",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterQueries = () => {
    let filtered = queries

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (query) =>
          query.QID.toString().includes(searchTerm) ||
          query.Email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          query.QueryDesc.toLowerCase().includes(searchTerm.toLowerCase()) ||
          query.OrgCode.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply status filter
    if (statusFilter !== "All") {
      filtered = filtered.filter((query) => query.Status === statusFilter)
    }

    setFilteredQueries(filtered)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Open":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            Open
          </Badge>
        )
      case "In Progress":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
            In Progress
          </Badge>
        )
      case "Closed":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
            Closed
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row justify-between items-center gap-4">
  <h1 className="text-2xl font-bold text-foreground">Support Tickets</h1>
  <div className="flex flex-1 sm:flex-none items-center gap-4">
    <div className="relative flex-1 sm:w-48">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
      <Input placeholder="Search by ID, email, description, or org code..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
    </div>
    <Select value={statusFilter} onValueChange={setStatusFilter}>
      <SelectTrigger className="w-full sm:w-40">
        <Filter className="w-4 h-4 mr-2" />
        <SelectValue placeholder="All Status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="All">All Status</SelectItem>
        <SelectItem value="Open">Open</SelectItem>
        <SelectItem value="In Progress">In Progress</SelectItem>
        <SelectItem value="Closed">Closed</SelectItem>
      </SelectContent>
    </Select>
  </div>
</motion.div>

        {/* Tickets Table */}
        <Card>
          
        
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
            ) : filteredQueries.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground">No tickets found</h3>
                <p className="text-sm text-muted-foreground">
                  {searchTerm || statusFilter !== "All"
                    ? "Try adjusting your search or filters"
                    : "No support tickets yet"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">ID</TableHead>
                         <TableHead>Date</TableHead>
                  
                      <TableHead>Organization</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="max-w-[300px]">Description</TableHead>
                   
                      <TableHead>Created By</TableHead>
                          <TableHead>Status</TableHead>
                      <TableHead>File</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQueries.map((query) => (
                      <motion.tr
                        key={query.QID}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="hover:bg-muted/50"
                      >
                        <TableCell className="font-mono font-medium">#{query.QID}</TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="w-3 h-3 mr-1" />
                     {new Date(query.TransDate).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })}
                          </div>
                        </TableCell>
                      
                        <TableCell className="font-medium">{query.OrgCode}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Mail className="w-3 h-3 mr-1 text-muted-foreground" />
                            {query.Email}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[300px]">
                          <div className="truncate" title={query.QueryDesc}>
                            {truncateText(query.QueryDesc, 60)}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center text-sm">
                            <User className="w-3 h-3 mr-1 text-muted-foreground" />
                            {query.TransBy}
                          </div>
                        </TableCell>
                          <TableCell>{getStatusBadge(query.Status)}</TableCell>
                        <TableCell>
                          {query.QueryFile ? (
                            <a
                              href={`https://api.smartcorpweb.com${query.QueryFile}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-primary hover:underline text-sm"
                            >
                              <FileText className="w-3 h-3 mr-1" />
                              View
                            </a>
                          ) : (
                            <span className="text-muted-foreground text-sm">No file</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/sa-tickets/edit/${query.QID}`}>
                                <Edit className="w-3 h-3" />
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          
        </Card>
      </div>
    </DashboardLayout>
  )
}
