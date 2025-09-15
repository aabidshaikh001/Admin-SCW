"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Search, Filter, Plus, Edit, Trash2, FileText, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"

interface TOS {
  id: number
  OrgCode: number
  question: string
  answer: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function TOSPage() {
     const { user } = useAuth()
  const [tosItems, setTosItems] = useState<TOS[]>([])
  const [filteredTosItems, setFilteredTosItems] = useState<TOS[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<number | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchTosItems()
  }, [])

  useEffect(() => {
    filterTosItems()
  }, [searchTerm, statusFilter, tosItems])

 const fetchTosItems = async () => {
  try {
    setLoading(true)
    const orgCode = user?.OrgCode || 1
    const response = await fetch(`https://api.smartcorpweb.com/api/returns/${orgCode}`)
    const result = await response.json()
    setTosItems(result.data || [])
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to fetch Return & Refund",
      variant: "destructive",
    })
  } finally {
    setLoading(false)
  }
}
 const filterTosItems = () => {
    let filtered = tosItems

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.answer.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply status filter
    if (statusFilter !== "All") {
      filtered = filtered.filter((item) => {
        if (statusFilter === "Active") return item.isActive
        if (statusFilter === "Inactive") return !item.isActive
        return true
      })
    }

    setFilteredTosItems(filtered)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this Return & Refund item?")) return

    try {
      setDeleting(id)
      const orgCode = user?.OrgCode || 1 // Replace with actual org code from auth
      const response = await fetch(`https://api.smartcorpweb.com/api/returns/${orgCode}/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Return & Refund item deleted successfully",
        })
        fetchTosItems()
      } else {
        throw new Error("Failed to delete")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete Return & Refund item",
        variant: "destructive",
      })
    } finally {
      setDeleting(null)
    }
  }

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
        <Eye className="w-3 h-3 mr-1" />
        Active
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">
        <EyeOff className="w-3 h-3 mr-1" />
        Inactive
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
            <h1 className="text-3xl font-bold text-foreground">Return & Refund</h1>
            <p className="text-muted-foreground">Manage your Return & Refund content</p>
          </div>
          <Link href="/admin-terms/return-and-refund/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add New TOS
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
                  placeholder="Search Return & Refund..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
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
            </div>
          </CardContent>
        </Card>

        {/* Return & Refund Table */}
        <Card>
          <CardHeader>
            <CardTitle>Return & Refund Items ({filteredTosItems.length})</CardTitle>
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
            ) : filteredTosItems.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground">No Return & Refund found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchTerm || statusFilter !== "All"
                    ? "Try adjusting your search or filters"
                    : "Get started by creating your first Return & Refund item"}
                </p>
                <Link href="/admin-terms/return-and-refund/create">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add New TOS
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Question</TableHead>
                      <TableHead>Answer Preview</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTosItems.map((item) => (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="group"
                      >
                        <TableCell className="font-medium max-w-xs">
                          <div className="truncate" title={item.question}>
                            {item.question}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-md">
                          <div className="truncate text-muted-foreground" title={item.answer}>
                            {item.answer}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(item.isActive)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(item.updatedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Link href={`/admin-terms/return-and-refund/edit/${item.id}`}>
                              <Button variant="outline" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </Link>
                       
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
