"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Search, Filter, Plus, Edit, Trash2, Shield, FileText } from "lucide-react"
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
interface PrivacyPolicy {
  id: number
  OrgCode: number
  question: string
  answer: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function PrivacyPolicyPage() {
     const { user } = useAuth()
  const [privacyPolicies, setPrivacyPolicies] = useState<PrivacyPolicy[]>([])
  const [filteredPolicies, setFilteredPolicies] = useState<PrivacyPolicy[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<number | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchPrivacyPolicies()
  }, [])

  useEffect(() => {
    filterPolicies()
  }, [searchTerm, statusFilter, privacyPolicies])

  const fetchPrivacyPolicies = async () => {
    try {
      setLoading(true)
         const orgCode = user?.OrgCode || 1 // Replace with actual org code from auth

      const response = await fetch(`https://api.smartcorpweb.com/api/privacy/${orgCode}`)
      const data = await response.json()
      setPrivacyPolicies(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch privacy policies",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterPolicies = () => {
    let filtered = privacyPolicies

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (policy) =>
          policy.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          policy.answer.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply status filter
    if (statusFilter !== "All") {
      const isActive = statusFilter === "Active"
      filtered = filtered.filter((policy) => policy.isActive === isActive)
    }

    setFilteredPolicies(filtered)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this privacy policy item?")) return

    try {
      setDeleting(id)
      const orgCode = user?.OrgCode || 1 // Replace with actual org code from auth

      const response = await fetch(`https://api.smartcorpweb.com/api/privacy/${orgCode}/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Privacy policy item deleted successfully",
        })
        fetchPrivacyPolicies()
      } else {
        throw new Error("Failed to delete privacy policy item")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete privacy policy item",
        variant: "destructive",
      })
    } finally {
      setDeleting(null)
    }
  }

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
        Active
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">
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
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Shield className="w-8 h-8" />
              Privacy Policy Management
            </h1>
            <p className="text-muted-foreground">Manage privacy policy content and sections</p>
          </div>
          <Link href="/admin-terms/privacy-policy/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Privacy Policy Item
            </Button>
          </Link>
        </motion.div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Privacy Policy Items</CardTitle>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search privacy policy items..."
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
            ) : filteredPolicies.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground">No privacy policy items found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchTerm || statusFilter !== "All"
                    ? "Try adjusting your search or filters"
                    : "Get started by creating your first privacy policy item"}
                </p>
                <Link href="/admin-terms/privacy-policy/create">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Privacy Policy Item
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Question/Section</TableHead>
                      <TableHead>Answer Preview</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPolicies.map((policy) => (
                      <motion.tr
                        key={policy.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="group hover:bg-muted/50"
                      >
                        <TableCell>
                          <div className="font-medium">{policy.question}</div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate text-muted-foreground">{policy.answer}</div>
                        </TableCell>
                        <TableCell>{getStatusBadge(policy.isActive)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(policy.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(policy.updatedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/admin-terms/privacy-policy/edit/${policy.id}`}>
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(policy.id)}
                              disabled={deleting === policy.id}
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
