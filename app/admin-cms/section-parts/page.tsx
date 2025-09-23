"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Edit, Plus, Search } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
interface SectionPart {
  id: number
  OrgCode: number
  sectionName: string
  title: string
  titleColor: string
  subTitle: string
  subTitleColor: string
  description: string
  descriptionColor: string
  btn1Text: string
  btn1TextColor: string
  btn1BgColor: string
  btn1URL: string
  btn2Text: string
  btn2TextColor: string
  btn2BgColor: string
  btn2URL: string
  sectionBGType: string
  sectionBGColor: string
  sectionBGImg: string
  sectionBGVideo: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function SectionPartsPage() {
      const { user } = useAuth()
  const orgCode = user?.OrgCode || 1
  const [sectionParts, setSectionParts] = useState<SectionPart[]>([])
  const [filteredParts, setFilteredParts] = useState<SectionPart[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [bgTypeFilter, setBgTypeFilter] = useState<string>("all")
  const { toast } = useToast()

  useEffect(() => {
    fetchSectionParts()
  }, [])

  useEffect(() => {
    filterParts()
  }, [sectionParts, searchTerm, statusFilter, bgTypeFilter])

  const fetchSectionParts = async () => {
    try {
      const response = await fetch(`https://api.smartcorpweb.com/api/section-parts?OrgCode=${orgCode}`)
      if (response.ok) {
        const data = await response.json()
        setSectionParts(data)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch section parts",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterParts = () => {
    let filtered = sectionParts

    if (searchTerm) {
      filtered = filtered.filter(
        (part) =>
          part.sectionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          part.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          part.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((part) => (statusFilter === "active" ? part.isActive : !part.isActive))
    }

    if (bgTypeFilter !== "all") {
      filtered = filtered.filter((part) => part.sectionBGType === bgTypeFilter)
    }

    setFilteredParts(filtered)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this section part?")) return

    try {
      const response = await fetch(`https://api.smartcorpweb.com/api/section-parts/${id}?OrgCode=${orgCode}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Section part deleted successfully",
        })
        fetchSectionParts()
      } else {
        throw new Error("Failed to delete")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete section part",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout>
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Section Parts Management</h1>
          <p className="text-muted-foreground">Manage website section components</p>
        </div>
        <Link href="/admin-cms/section-parts/create">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Section Part
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by section name, title, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={bgTypeFilter} onValueChange={setBgTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
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

      <Card>
        <CardHeader>
          <CardTitle>Section Parts ({filteredParts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Section Name</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Buttons</TableHead>
                  <TableHead>Background</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParts.map((part) => (
                  <TableRow key={part.id}>
                    <TableCell className="font-medium">{part.sectionName}</TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <div className="font-medium truncate" style={{ color: part.titleColor }}>
                          {part.title}
                        </div>
                        {part.subTitle && (
                          <div className="text-sm truncate" style={{ color: part.subTitleColor }}>
                            {part.subTitle}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate text-sm" style={{ color: part.descriptionColor }}>
                        {part.description}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {part.btn1Text && (
                          <div className="flex items-center gap-2">
                            <div
                              className="px-2 py-1 rounded text-xs"
                              style={{
                                color: part.btn1TextColor,
                                backgroundColor: part.btn1BgColor,
                              }}
                            >
                              {part.btn1Text}
                            </div>
                          </div>
                        )}
                        {part.btn2Text && (
                          <div className="flex items-center gap-2">
                            <div
                              className="px-2 py-1 rounded text-xs"
                              style={{
                                color: part.btn2TextColor,
                                backgroundColor: part.btn2BgColor,
                              }}
                            >
                              {part.btn2Text}
                            </div>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant="outline">{part.sectionBGType}</Badge>
                        {part.sectionBGType === "color" && part.sectionBGColor && (
                          <div className="w-4 h-4 rounded border" style={{ backgroundColor: part.sectionBGColor }} />
                        )}
                        {part.sectionBGType === "image" && part.sectionBGImg && (
                          <div className="text-xs text-muted-foreground">Image</div>
                        )}
                        {part.sectionBGType === "video" && part.sectionBGVideo && (
                          <div className="text-xs text-muted-foreground">Video</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={part.isActive ? "default" : "secondary"}>
                        {part.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(part.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Link href={`/admin-cms/section-parts/edit/${part.id}`}>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(part.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredParts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">No section parts found matching your criteria.</div>
          )}
        </CardContent>
      </Card>
    </div>
    </DashboardLayout>
  )
}
