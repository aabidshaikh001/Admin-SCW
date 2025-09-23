"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Edit, Trash2, Eye, Filter } from "lucide-react"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"


interface Breadcrumb {
  id: number
  OrgCode: number
  pageName: string
  title: string
  titleColor: string
  subTitle: string
  subTitleColor: string
  description: string
  descriptionColor: string
  rtnURL: string
  pageHeaderBGType: string
  pageHeaderBGColor: string
  pageHeaderBGImg: string
  pageHeaderBGVideo: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function BreadcrumbsPage() {
    const { user } = useAuth()
      const orgCode = user?.OrgCode || 1
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [bgTypeFilter, setBgTypeFilter] = useState<string>("all")

  useEffect(() => {
    fetchBreadcrumbs()
  }, [])

  const fetchBreadcrumbs = async () => {
    try {
      setLoading(true)
      const response = await fetch(`https://api.smartcorpweb.com/api/breadcrumbs?OrgCode=${orgCode}`)
      if (!response.ok) throw new Error("Failed to fetch breadcrumbs")
      const data = await response.json()
      setBreadcrumbs(data)
    } catch (error) {
      console.error("Error fetching breadcrumbs:", error)
      toast({
        title: "Error",
        description: "Failed to fetch breadcrumbs",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this breadcrumb?")) return

    try {
      const response = await fetch(`https://api.smartcorpweb.com/api/breadcrumbs/${id}?OrgCode=${orgCode}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete breadcrumb")

      toast({
        title: "Success",
        description: "Breadcrumb deleted successfully",
      })
      fetchBreadcrumbs()
    } catch (error) {
      console.error("Error deleting breadcrumb:", error)
      toast({
        title: "Error",
        description: "Failed to delete breadcrumb",
        variant: "destructive",
      })
    }
  }

  const filteredBreadcrumbs = breadcrumbs.filter((breadcrumb) => {
    const matchesSearch =
      breadcrumb.pageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      breadcrumb.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      breadcrumb.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && breadcrumb.isActive) ||
      (statusFilter === "inactive" && !breadcrumb.isActive)
    const matchesBgType = bgTypeFilter === "all" || breadcrumb.pageHeaderBGType === bgTypeFilter

    return matchesSearch && matchesStatus && matchesBgType
  })

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
     <DashboardLayout>
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Breadcrumb Management</h1>
            <p className="text-muted-foreground">Manage page headers and breadcrumb sections</p>
          </div>
          <Link href="/admin-cms/breadcrumbs/create">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search by page name, title, or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={bgTypeFilter} onValueChange={setBgTypeFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by background" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Backgrounds</SelectItem>
                  <SelectItem value="color">Color</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredBreadcrumbs.length} of {breadcrumbs.length} breadcrumbs
          </p>
        </div>

        {/* Breadcrumbs Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Page Name</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Subtitle</TableHead>
                    <TableHead>Background</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBreadcrumbs.map((breadcrumb) => (
                    <TableRow key={breadcrumb.id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{breadcrumb.pageName}</span>
                          
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium" style={{ color: breadcrumb.titleColor }}>
                            {breadcrumb.title}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {breadcrumb.subTitle && (
                          <span className="text-sm" style={{ color: breadcrumb.subTitleColor || "inherit" }}>
                            {breadcrumb.subTitle}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">
                            {breadcrumb.pageHeaderBGType}
                          </Badge>
                          {breadcrumb.pageHeaderBGType === "color" && breadcrumb.pageHeaderBGColor && (
                            <div
                              className="w-4 h-4 rounded border"
                              style={{ backgroundColor: breadcrumb.pageHeaderBGColor }}
                            />
                          )}
                          {breadcrumb.pageHeaderBGType === "image" && breadcrumb.pageHeaderBGImg && (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                          {breadcrumb.pageHeaderBGType === "video" && breadcrumb.pageHeaderBGVideo && (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={breadcrumb.isActive ? "default" : "secondary"}>
                          {breadcrumb.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {new Date(breadcrumb.createdAt).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin-cms/breadcrumbs/edit/${breadcrumb.id}`}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(breadcrumb.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {filteredBreadcrumbs.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No breadcrumbs found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
     </DashboardLayout>
  )
}
