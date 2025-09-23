"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Edit, Trash2, Eye, EyeOff, Palette } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ImageIcon } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"
import { DashboardLayout } from "@/components/dashboard-layout"

interface Feature {
  id: number
  OrgCode: number
  title: string
  titleColor: string
  subTitle: string
  subTitleColor: string
  description: string
  descriptionColor: string
  isButton: boolean
  buttonText?: string
  buttonColor?: string
  buttonURL?: string
  Img?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function FeaturesPage() {
  const [features, setFeatures] = useState<Feature[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const { user } = useAuth()

  const orgCode = user?.OrgCode // This should come from auth provider

  useEffect(() => {
    if (orgCode) {
      fetchFeatures()
    }
  }, [orgCode])

  const fetchFeatures = async () => {
    try {
      setLoading(true)
      const response = await fetch(`https://api.smartcorpweb.com/api/industry?OrgCode=${orgCode}`)
      if (response.ok) {
        const data = await response.json()
        setFeatures(data)
      }
    } catch (error) {
      console.error("Error fetching Industriess:", error)
      toast({
        title: "Error",
        description: "Failed to fetch Industriess",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this Industries?")) return

    try {
      const response = await fetch(`https://api.smartcorpweb.com/api/industry/${id}?OrgCode=${orgCode}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Industries deleted successfully",
        })
        fetchFeatures()
      } else {
        throw new Error("Failed to delete Industries")
      }
    } catch (error) {
      console.error("Error deleting Industries:", error)
      toast({
        title: "Error",
        description: "Failed to delete Industries",
        variant: "destructive",
      })
    }
  }

  const filteredFeatures = features.filter((feature) => {
    const matchesSearch =
      feature.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feature.subTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feature.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && feature.isActive) ||
      (statusFilter === "inactive" && !feature.isActive)

    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
          <DashboardLayout>
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Industries Management</h1>
          <p className="text-muted-foreground">Manage your KRA Industries and their display settings</p>
        </div>
       <div className="flex items-center gap-2">
  {/* ✅ View All Industries Dialog */}
  <Dialog>
    <DialogTrigger asChild>
      <Button variant="outline">
        <ImageIcon className="w-4 h-4 mr-2" />
        View All
      </Button>
    </DialogTrigger>
    <DialogContent className="max-w-4xl">
      <DialogHeader>
        <DialogTitle>All Industries Preview</DialogTitle>
      </DialogHeader>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {features.map((feature) => (
          <div
            key={feature.id}
            className="flex flex-col items-center p-2 border rounded-lg shadow-sm text-center"
          >
            {/* Icon */}
            {feature.Img ? (
              <img
                src={`https://api.smartcorpweb.com${feature.Img}`}
                alt={feature.title}
                className="w-16 h-16 object-contain"
              />
            ) : (
              <div className="w-16 h-16 flex items-center justify-center bg-muted rounded">
                <ImageIcon className="w-8 h-8 text-muted-foreground" />
              </div>
            )}

            {/* Title */}
            <p className="mt-2 text-sm font-medium" style={{ color: feature.titleColor }}>
              {feature.title}
            </p>

            {/* Subtitle */}
            <span className="text-xs" style={{ color: feature.subTitleColor }}>
              {feature.subTitle}
            </span>

            {/* Description */}
            <p className="mt-1 text-xs" style={{ color: feature.descriptionColor }}>
              {feature.description}
            </p>

            {/* Button */}
            {feature.isButton && feature.buttonText && (
              <Link href={feature.buttonURL || "#"} target="_blank">
                <Button
                  size="sm"
                  className="mt-2"
                  style={{ backgroundColor: feature.buttonColor || "#007bff" }}
                >
                  {feature.buttonText}
                </Button>
              </Link>
            )}
          </div>
        ))}
      </div>
    </DialogContent>
  </Dialog>

  {/* Add Industries Button */}
  <Link href="/admin-kra/industries/create">
    <Button>
      <Plus className="w-4 h-4 mr-2" />
      Add Industries
    </Button>
  </Link>
</div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <div className="flex-1 max-w-sm">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search Industries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Industries ({filteredFeatures.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Subtitle</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Button</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFeatures.map((feature) => (
                <TableRow key={feature.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: feature.titleColor }}
                        title={`Color: ${feature.titleColor}`}
                      />
                      <span className="font-medium">{feature.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: feature.subTitleColor }}
                        title={`Color: ${feature.subTitleColor}`}
                      />
                      <span className="text-sm">{feature.subTitle}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: feature.descriptionColor }}
                        title={`Color: ${feature.descriptionColor}`}
                      />
                      <span className="text-sm text-muted-foreground max-w-[200px] truncate">
                        {feature.description}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {feature.isButton ? (
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded border"
                          style={{ backgroundColor: feature.buttonColor }}
                          title={`Color: ${feature.buttonColor}`}
                        />
                        <span className="text-sm">{feature.buttonText}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">No button</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={feature.isActive ? "default" : "secondary"}>
                      {feature.isActive ? (
                        <>
                          <Eye className="w-3 h-3 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3 mr-1" />
                          Inactive
                        </>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(feature.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin-kra/industries/edit/${feature.id}`}>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(feature.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredFeatures.length === 0 && (
            <div className="text-center py-8">
              <Palette className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Industries found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Create your first Industries to get started"}
              </p>
              {!searchTerm && statusFilter === "all" && (
                <Link href="/admin-kra/industries/create">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Industries
                  </Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
    </div>
    </DashboardLayout>
  )
}
