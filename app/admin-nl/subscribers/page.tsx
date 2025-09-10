"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Search, Filter, Mail, Plus, Edit, Trash2, UserCheck, UserX, X } from "lucide-react"
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

interface Subscriber {
  Id: number
  OrgCode: number
  Email: string
  IsActive: boolean
  CreatedAt: string
  UpdatedAt: string
}

export default function SubscribersPage() {
  const { user } = useAuth()
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [filteredSubscribers, setFilteredSubscribers] = useState<Subscriber[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<number | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchSubscribers()
  }, [])

  useEffect(() => {
    filterSubscribers()
  }, [searchTerm, statusFilter, subscribers])

  const fetchSubscribers = async () => {
    try {
      setLoading(true)
      const orgCode = `${user?.OrgCode}`
      const response = await fetch(`http://localhost:5000/api/newsletter/subscribers/${orgCode}`)
      const data = await response.json()
      setSubscribers(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch subscribers",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterSubscribers = () => {
    let filtered = subscribers

    if (searchTerm) {
      filtered = filtered.filter((subscriber) =>
        subscriber.Email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== "All") {
      const isActive = statusFilter === "Active"
      filtered = filtered.filter((subscriber) => subscriber.IsActive === isActive)
    }

    setFilteredSubscribers(filtered)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this subscriber?")) return

    try {
      setDeleting(id)
      const response = await fetch(`http://localhost:5000/api/newsletter/subscriber/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({ title: "Success", description: "Subscriber deleted successfully" })
        fetchSubscribers()
      } else {
        throw new Error("Failed to delete")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete subscriber",
        variant: "destructive",
      })
    } finally {
      setDeleting(null)
    }
  }

  const resetFilters = () => {
    setSearchTerm("")
    setStatusFilter("All")
  }

  const getStatusBadge = (isActive: boolean) =>
    isActive ? (
      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
        <UserCheck className="w-3 h-3 mr-1" />
        Active
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
        <UserX className="w-3 h-3 mr-1" />
        Inactive
      </Badge>
    )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with search & filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <h1 className="text-3xl font-bold text-foreground">Newsletter Subscribers</h1>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            {/* Reset Button */}
            {(searchTerm || statusFilter !== "All") && (
              <Button variant="outline" onClick={resetFilters}>
                Reset
              </Button>
            )}

            {/* Add New */}
            <Link href="/admin-nl/subscribers/create">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Table */}
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
            ) : filteredSubscribers.length === 0 ? (
              <div className="text-center py-8">
                <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground">No subscribers found</h3>
                <p className="text-sm text-muted-foreground">
                  {searchTerm || statusFilter !== "All"
                    ? "Try adjusting your search or filters"
                    : "No subscribers yet"}
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubscribers.map((subscriber) => (
                      <TableRow key={subscriber.Id}>
                        <TableCell className="font-mono text-sm">#{subscriber.Id}</TableCell>
                        <TableCell className="font-medium">{subscriber.Email}</TableCell>
                        <TableCell>{getStatusBadge(subscriber.IsActive)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(subscriber.CreatedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(subscriber.UpdatedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Link href={`/admin-nl/subscribers/edit/${subscriber.Id}`}>
                              <Button variant="outline" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </Link>
                            {/* <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(subscriber.Id)}
                              disabled={deleting === subscriber.Id}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button> */}
                          </div>
                        </TableCell>
                      </TableRow>
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
