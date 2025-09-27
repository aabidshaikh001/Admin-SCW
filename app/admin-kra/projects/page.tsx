"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Edit, Trash2, Eye, EyeOff, Palette } from "lucide-react"
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
      const response = await fetch(`https://api.smartcorpweb.com/api/projects?OrgCode=${orgCode}`)
      if (response.ok) {
        const data = await response.json()
        setFeatures(data)
      }
    } catch (error) {
      console.error("Error fetching Projectss:", error)
      toast({
        title: "Error",
        description: "Failed to fetch Projectss",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this Projects?")) return

    try {
      const response = await fetch(`https://api.smartcorpweb.com/api/projects/${id}?OrgCode=${orgCode}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Projects deleted successfully",
        })
        fetchFeatures()
      } else {
        throw new Error("Failed to delete Projects")
      }
    } catch (error) {
      console.error("Error deleting Projects:", error)
      toast({
        title: "Error",
        description: "Failed to delete Projects",
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
          <h1 className="text-2xl font-bold text-foreground">Projects Management</h1>
       
        </div>
         <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search Projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
       
        {/* Left: Dialog Preview */}
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Live Preview
              </Button>
            </DialogTrigger>
           <DialogContent className="w-[700px] max-w-[95%]">
  <DialogHeader>
    <DialogTitle>Projects Preview</DialogTitle>
  </DialogHeader>

  {features.length > 0 ? (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
      {features.map((feature) => (
        <Card
  key={feature.id}
  className="transition-transform hover:scale-[1.03] hover:shadow-lg duration-200 h-[200px]"
>
  <CardContent className="p-2 flex flex-col items-center justify-between">
    <div className="w-full h-[80px] overflow-hidden rounded-md">
      <img
        src={`https://api.smartcorpweb.com${feature.Img}`}
        alt={feature.title}
        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
      />
    </div>
    <div className="text-center mt-2">
      <h3
        className="text-sm font-semibold truncate"
        style={{ color: feature.titleColor }}
      >
        {feature.title}
      </h3>
      <p
        className="text-xs truncate"
        style={{ color: feature.subTitleColor }}
      >
        {feature.subTitle}
      </p>
      <p
        className="text-xs text-muted-foreground truncate"
        style={{ color: feature.descriptionColor }}
      >
        {feature.description}
      </p>
    </div>
    {feature.isButton && feature.buttonText && (
      <Link href={feature.buttonURL || "#"} target="_blank">
        <Button
          className="mt-1 px-2 py-1 text-xs rounded-sm"
          style={{ backgroundColor: feature.buttonColor }}
        >
          {feature.buttonText}
        </Button>
      </Link>
    )}
  </CardContent>
</Card>

      ))}
    </div>
  ) : (
    <p className="text-center text-muted-foreground mt-4">No projects available</p>
  )}

 
</DialogContent>          </Dialog>

          {/* Right: Add Projects */}
          <Link href="/admin-kra/projects/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
             New
            </Button>
          </Link>
        </div>
      </div>

      

      <Card>
        
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
                      <Link href={`/admin-kra/projects/edit/${feature.id}`}>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      {/* <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(feature.id)}
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

          {filteredFeatures.length === 0 && (
            <div className="text-center py-8">
              <Palette className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Projects found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Create your first Projects to get started"}
              </p>
              {!searchTerm && statusFilter === "all" && (
                <Link href="/admin-kra/projects/create">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Projects
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
