"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Search, Filter, Mail, FileText, Calendar, User, Plus } from "lucide-react"
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

export default function UserTicketsPage() {
  const [queries, setQueries] = useState<SMTranQuery[]>([])
  const [filteredQueries, setFilteredQueries] = useState<SMTranQuery[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    if (user?.OrgCode) {
      fetchQueries()
    }
  }, [user?.OrgCode])

  useEffect(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()
    let filtered = queries

    if (normalizedSearch) {
      filtered = filtered.filter((query) =>
        query.QID.toString().includes(normalizedSearch) ||
        (query.QueryDesc ?? "").toLowerCase().includes(normalizedSearch) ||
        (query.Status ?? "").toLowerCase().includes(normalizedSearch)
      )
    }

    if (statusFilter !== "All") {
      filtered = filtered.filter((query) => query.Status === statusFilter)
    }

    setFilteredQueries(filtered)
  }, [searchTerm, statusFilter, queries])

  const fetchQueries = async () => {
    if (!user?.OrgCode) return

    try {
      setLoading(true)
      const response = await fetch(`https://api.smartcorpweb.com/api/queries/org/${user.OrgCode}`)
      const data = await response.json()
      
      if (data.success) {
        setQueries(data.data)
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to fetch your tickets",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch your tickets",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
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
    if (!text) return "No description"
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
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
          className="flex flex-col sm:flex-row justify-between items-center gap-4"
        >
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Support Tickets</h1>
            <p className="text-sm text-muted-foreground">
              Organization: <span className="font-mono font-medium">{user.OrgCode}</span>
            </p>
          </div>
          <div className="flex flex-1 sm:flex-none items-center gap-4">
            <div className="relative flex-1 sm:w-48">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                placeholder="Search by ID or description..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="pl-10" 
              />
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
            <Button asChild>
              <Link href="/admin-reports/new">
                <Plus className="w-4 h-4 mr-2" />
                New Ticket
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Tickets Table */}
        <Card>
          <CardHeader>
            <CardTitle>Ticket History</CardTitle>
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
            ) : filteredQueries.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground">
                  {searchTerm || statusFilter !== "All" ? "No matching tickets found" : "No tickets yet"}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchTerm || statusFilter !== "All" 
                    ? "Try adjusting your search or filters" 
                    : "Create your first support ticket to get started"
                  }
                </p>
                {!searchTerm && statusFilter === "All" && (
                  <Button asChild>
                    <Link href="/admin-reports/new">
                      <Plus className="w-4 h-4 mr-2" />
                      Create New Ticket
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="max-w-[300px]">Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Admin Response</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead>File</TableHead>
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
                        <TableCell className="max-w-[300px]">
                          <div className="truncate" title={query.QueryDesc}>
                            {truncateText(query.QueryDesc, 60)}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(query.Status)}</TableCell>
                        <TableCell className="max-w-[200px]">
                          <div className="truncate" title={query.SysAdmDesc}>
                            {truncateText(query.SysAdmDesc || "No response yet", 40)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {query.TranUpdate ? (
                            <div className="text-xs text-muted-foreground">
                              {new Date(query.TranUpdate).toLocaleDateString()}
                              <br />
                              <span className="text-xs">by {query.TranByUpdate}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
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