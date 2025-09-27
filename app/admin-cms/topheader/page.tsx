"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Edit, Trash2, Eye, EyeOff, Heater } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface HeaderType {
  id: number
  OrgCode: number
  name: string
  img?: string
  URL?: string
  alignText?: string
  textColor?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function HeadersPage() {
  const [headers, setHeaders] = useState<HeaderType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
    const [bgColor, setBgColor] = useState<string>("#1e40af") // default = Tailwind blue-800
  const [statusFilter, setStatusFilter] = useState<string>("all")
 const { user } = useAuth()
 
   const orgCode = user?.OrgCode

  useEffect(() => {
    fetchHeaders()
  }, [])

  const fetchHeaders = async () => {
    try {
      setLoading(true)
      const response = await fetch(`https://api.smartcorpweb.com/api/header?OrgCode=${orgCode}`)
      if (response.ok) {
        const data = await response.json()
        setHeaders(data)
      }
    } catch (error) {
      console.error("Error fetching headers:", error)
      toast({
        title: "Error",
        description: "Failed to fetch headers",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this header?")) return

    try {
      const response = await fetch(`https://api.smartcorpweb.com/api/header/${id}?OrgCode=${orgCode}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Header deleted successfully",
        })
        fetchHeaders()
      } else {
        throw new Error("Failed to delete header")
      }
    } catch (error) {
      console.error("Error deleting header:", error)
      toast({
        title: "Error",
        description: "Failed to delete header",
        variant: "destructive",
      })
    }
  }

  const filteredHeaders = headers.filter((header) => {
    const matchesSearch =
      header.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (header.URL && header.URL.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && header.isActive) ||
      (statusFilter === "inactive" && !header.isActive)

    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Header Management</h1>
          
          </div>
          <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search headers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
          <div className="flex items-center gap-3">
           

            {/* Preview Button */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Header Preview</DialogTitle>
                </DialogHeader>

                {/* Full Header Preview with dynamic background */}
                <div
                  className="flex justify-between items-center text-white px-6 py-3 rounded"
                  style={{ backgroundColor: bgColor }}
                >
                  {/* LEFT ITEMS */}
                  <div className="flex gap-6">
                    {headers
                      .filter((h) => h.alignText === "left" && h.isActive)
                      .map((h) => (
                        <a
                          key={h.id}
                          href={h.URL || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm"
                          style={{ color: h.textColor }}
                        >
                          {h.img && (
                            <img
                              src={`https://api.smartcorpweb.com${h.img}`}
                              alt={h.name}
                              className="w-4 h-4"
                            />
                          )}
                          {h.name === "Phone" && h.URL?.startsWith("tel:")
                            ? h.URL.replace("tel:", "+")
                            : h.URL}
                        </a>
                      ))}
                  </div>

                  {/* CENTER ITEMS */}
                  <div className="flex gap-6">
                    {headers
                      .filter((h) => h.alignText === "center" && h.isActive)
                      .map((h) => (
                        <a
                          key={h.id}
                          href={h.URL || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm"
                          style={{ color: h.textColor }}
                        >
                          {h.img && (
                            <img
                              src={`https://api.smartcorpweb.com${h.img}`}
                              alt={h.name}
                              className="w-4 h-4"
                            />
                          )}
                          {h.URL}
                        </a>
                      ))}
                  </div>

                  {/* RIGHT ITEMS */}
                  <div className="flex gap-6">
                    {headers
                      .filter((h) => h.alignText === "right" && h.isActive)
                      .map((h) => (
                        <a
                          key={h.id}
                          href={h.URL || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm"
                          style={{ color: h.textColor }}
                        >
                          {h.img && (
                            <img
                              src={`https://api.smartcorpweb.com${h.img}`}
                              alt={h.name}
                              className="w-4 h-4"
                            />
                          )}
                        </a>
                      ))}
                  </div>
                </div>
                 {/* Background Color Controller */}
         <div className="flex items-center gap-3 mt-4">
              <label className="text-sm font-medium">Background:</label>
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-10 h-10 p-0 border rounded"
              />
              {/* Hex Code Display */}
  <span className="text-sm font-mono">{bgColor}</span>
            </div>
              </DialogContent>
            </Dialog>
          
    {/* Add Header Button */}
    <Link href="/admin-cms/topheader/create">
      <Button>
        <Plus className="w-4 h-4 mr-2" />
      New
      </Button>
    </Link>
  </div>
</div>      


      <Card>
        <CardHeader>
          <CardTitle>Headers ({filteredHeaders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Alignment</TableHead>
                <TableHead>Text Color</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHeaders.map((header) => (
                <TableRow key={header.id}>
                  <TableCell>
                    {header.img ? (
                      <img
                        src={`https://api.smartcorpweb.com${header.img}`}
                        alt={header.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                        <Heater className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{header.name}</span>
                  </TableCell>
                  <TableCell>
                    {header.URL ? (
                      <a
                        href={header.URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        {header.URL.length > 30 ? `${header.URL.substring(0, 30)}...` : header.URL}
                      </a>
                    ) : (
                      <span className="text-muted-foreground text-sm">No URL</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm capitalize">{header.alignText || "left"}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: header.textColor || "#000000" }}
                        title={`Color: ${header.textColor || "#000000"}`}
                      />
                      <span className="text-sm">{header.textColor || "#000000"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={header.isActive ? "default" : "secondary"}>
                      {header.isActive ? (
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
                    {new Date(header.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin-cms/topheader/edit/${header.id}`}>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      {/* <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(header.id)}
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

          {filteredHeaders.length === 0 && (
            <div className="text-center py-8">
              <Heater className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No headers found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Create your first header to get started"}
              </p>
              {!searchTerm && statusFilter === "all" && (
                <Link href="/admin-cms/topheader/create">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Header
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
