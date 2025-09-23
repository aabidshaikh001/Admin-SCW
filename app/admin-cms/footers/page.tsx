"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Edit, Trash2, ExternalLink, Eye } from "lucide-react"
import Link from "next/link"
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram } from "react-icons/fa"
import { useAuth } from "@/contexts/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface Footer {
  id: number
  OrgCode: number
  colId: number
  colType: string
  name: string
  description: string
  URL: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface Organization {
  OrgName: string

  Logo: string
  SocialFB: string
  SocialInsta: string
  SocialTwitter: string
  SocialLinkedIn: string
  SocialYoutube: string
}

export default function FootersPage() {
  const { user } = useAuth()
  const orgCode = user?.OrgCode || 1
  const [footers, setFooters] = useState<Footer[]>([])
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
    const [bgColor, setBgColor] = useState<string>("#1e40af") // default = Tailwind blue-800

  useEffect(() => {
    fetchFooters()
    fetchOrganization()
  }, [])

  const fetchFooters = async () => {
    try {
      setLoading(true)
      const response = await fetch(`https://api.smartcorpweb.com/api/footers?OrgCode=${orgCode}`)
      const data = await response.json()
      setFooters(data)
    } catch (error) {
      console.error("Error fetching footers:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchOrganization = async () => {
    try {
      const response = await fetch(`https://api.smartcorpweb.com/api/orgs/profile/${orgCode}`)
      const data = await response.json()
      setOrganization(data)
    } catch (error) {
      console.error("Error fetching organization:", error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this footer item?")) return

    try {
      const response = await fetch(`https://api.smartcorpweb.com/api/footers/${id}?OrgCode=${orgCode}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchFooters()
      }
    } catch (error) {
      console.error("Error deleting footer:", error)
    }
  }

  const filteredFooters = footers.filter((footer) => {
    const matchesSearch =
      footer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      footer.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && footer.isActive) ||
      (statusFilter === "inactive" && !footer.isActive)
    const matchesType = typeFilter === "all" || footer.colType === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  const uniqueTypes = [...new Set(footers.map((footer) => footer.colType).filter(Boolean))]

  // Group footer items by column
  const footerColumns = {
    about: footers.filter(footer => footer.colType === "info"),
    links: footers.filter(footer => footer.colType === "links"),
    others: footers.filter(footer => footer.colType === "others")
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-balance">Footer Management</h1>
            <p className="text-muted-foreground">Manage footer sections and links</p>
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
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Footer Preview</DialogTitle>
                </DialogHeader>
                
                {/* Footer Preview */}
                <div className="bg-gray-900  p-8 rounded-lg"
                   style={{ backgroundColor: bgColor }}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    
                    {/* About Column */}
                    <div>
                       {organization?.Logo && (
                        <img 
                          src={`https://api.smartcorpweb.com${organization.Logo}`} 
                          alt={organization.OrgName} 
                          className="h-12 mb-4"
                        />
                      )}
                      <h3 className="text-xl font-bold mb-4"></h3>
                      {footerColumns.about.map(item => (
                        <p key={item.id} className="text-gray-300 mb-4">
                          {item.description}
                        </p>
                      ))}
                     
                    <div className="flex space-x-4">
  {organization?.SocialFB && (
    <a href={organization.SocialFB} target="_blank" rel="noopener noreferrer">
      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
        <FaFacebookF className="text-white w-4 h-4" />
      </div>
    </a>
  )}
  {organization?.SocialTwitter && (
    <a href={organization.SocialTwitter} target="_blank" rel="noopener noreferrer">
      <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center">
        <FaTwitter className="text-white w-4 h-4" />
      </div>
    </a>
  )}
  {organization?.SocialLinkedIn && (
    <a href={organization.SocialLinkedIn} target="_blank" rel="noopener noreferrer">
      <div className="w-8 h-8 bg-blue-800 rounded-full flex items-center justify-center">
        <FaLinkedinIn className="text-white w-4 h-4" />
      </div>
    </a>
  )}
  {organization?.SocialInsta && (
    <a href={organization.SocialInsta} target="_blank" rel="noopener noreferrer">
      <div className="w-8 h-8 bg-pink-600 rounded-full flex items-center justify-center">
        <FaInstagram className="text-white w-4 h-4" />
      </div>
    </a>
  )}
</div>
</div>

                    {/* Links Column */}
                    <div>
                      <h3 className="text-xl font-bold mb-4"></h3>
                      <ul className="space-y-2">
                        {footerColumns.links.map(item => (
                          <li key={item.id}>
                            <a 
                              href={item.URL} 
                              className="text-gray-300 hover:text-white transition-colors"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {item.name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Others Column */}
                    <div>
                      <h3 className="text-xl font-bold mb-4"></h3>
                      <ul className="space-y-2">
                        {footerColumns.others.map(item => (
                          <li key={item.id}>
                            <a 
                              href={item.URL} 
                              className="text-gray-300 hover:text-white transition-colors"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {item.name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                 
                  {/* Copyright */}
                  <div className="border-t border-gray-700 mt-6 pt-6 text-center text-gray-400">
                    <p>© {new Date().getFullYear()} {organization?.OrgName || 'Your Organization'}. All rights reserved.</p>
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

            <Button asChild>
              <Link href="/admin-cms/footers/create">
                <Plus className="w-4 h-4 mr-2" />
                Add Footer Item
              </Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Footer Items ({filteredFooters.length})</CardTitle>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search footer items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
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
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {uniqueTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Column</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFooters.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No footer items found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredFooters.map((footer) => (
                      <TableRow key={footer.id}>
                        <TableCell className="font-medium">{footer.name}</TableCell>
                        <TableCell className="max-w-xs truncate">{footer.description}</TableCell>
                        <TableCell>{footer.colType && <Badge variant="outline">{footer.colType}</Badge>}</TableCell>
                        <TableCell>{footer.colId}</TableCell>
                        <TableCell>
                          {footer.URL && (
                            <div className="flex items-center gap-2">
                              <span className="max-w-xs truncate text-sm">{footer.URL}</span>
                              <Button variant="ghost" size="sm" asChild>
                                <a href={footer.URL} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </Button>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={footer.isActive ? "default" : "secondary"}>
                            {footer.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(footer.updatedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/admin-cms/footers/edit/${footer.id}`}>
                                <Edit className="w-4 h-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(footer.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}