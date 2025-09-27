"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Search, Filter, Plus, Edit, Trash2, User, Calendar, ExternalLink } from "lucide-react"
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
interface TeamMember {
  Id: number
  OrgCode: number
  Name: string
  Role: string
  Bio: string
  Img: string
  TransDate: string
  IsDeleted: boolean
  IsActive: boolean
  Linkedin?: string
  Twitter?: string
  Facebook?: string
}

export default function AuthorsPage() {
     const { user, isLoading } = useAuth()
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [filteredMembers, setFilteredMembers] = useState<TeamMember[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchTeamMembers()
  }, [])

  useEffect(() => {
    filterMembers()
  }, [searchTerm, statusFilter, teamMembers])

  const fetchTeamMembers = async () => {
    try {
      setLoading(true)
      // Replace with your actual API call
      const response = await fetch(`https://api.smartcorpweb.com/api/blog/authors/org/${user?.OrgCode}`)
      const result = await response.json()

      if (result.success && result.data) {
        setTeamMembers(result.data)
      } else {
        setTeamMembers([])
      }
    } catch (error) {
      console.error("Error fetching authors:", error)
      toast({
        title: "Error",
        description: "Failed to fetch authors",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterMembers = () => {
    let filtered = teamMembers

    if (searchTerm) {
      filtered = filtered.filter(
        (member) =>
          member.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.Role.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.Bio.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "All") {
      const isActive = statusFilter === "Active"
      filtered = filtered.filter((member) => member.IsActive === isActive)
    }

    setFilteredMembers(filtered)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this author?")) return

    try {
      const response = await fetch(`https://api.smartcorpweb.com/api/blog/authors/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete author")

      toast({
        title: "Success",
        description: "Author deleted successfully",
      })
      fetchTeamMembers()
    } catch (error) {
      console.error("Error deleting author:", error)
      toast({
        title: "Error",
        description: "Failed to delete author",
        variant: "destructive",
      })
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
  {/* Left side: Title */}
  <div className="flex items-center gap-4 w-full sm:w-auto">
    <h1 className="text-2xl font-bold text-foreground">Authors</h1>

    {/* Search bar in header */}
    <div className="relative w-full sm:w-64">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
      <Input
        placeholder="Search authors..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-10"
      />
    </div>
  </div>

  {/* Right side: New button */}
  <Link href="/admin-blog/blog-authors/edit/new">
    <Button className="bg-primary hover:bg-primary/90">
      <Plus className="w-4 h-4 mr-2" />
      New
    </Button>
  </Link>
</motion.div>

        {/* Filters */}
        <Card>
        
        
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="animate-pulse flex space-x-4 p-3 border rounded-lg">
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="text-center py-8">
                <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground">No authors found</h3>
                <p className="text-sm text-muted-foreground">
                  {searchTerm || statusFilter !== "All"
                    ? "Try adjusting your search or filters"
                    : "Get started by adding your first author"}
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Bio</TableHead>
                      <TableHead>Status</TableHead>
                    
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.map((member) => (
                      <TableRow key={member.Id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {member.Img ? (
                            <img
  src={`https://api.smartcorpweb.com${member.Img}`}
  alt={member.Name}
  className="w-10 h-10 rounded-full object-cover"
/>

                            ) : (
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="w-5 h-5 text-primary" />
                              </div>
                            )}
                            <div>
                              <div className="font-medium">{member.Name}</div>
                              <div className="text-sm text-muted-foreground">ID: {member.Id}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{member.Role}</span>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <p className="text-sm line-clamp-2">{member.Bio || "No bio provided"}</p>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(member.IsActive)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {new Date(member.TransDate).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/admin-blog/blog-authors/edit/${member.Id}`}>
                              <Button variant="outline" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </Link>
                            {/* <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(member.Id)}
                              className="text-destructive hover:text-destructive"
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
