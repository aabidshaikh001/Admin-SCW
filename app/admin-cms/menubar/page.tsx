"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, Edit, Trash2, Eye, Filter, EyeOff } from "lucide-react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface Menu {
  id: number
  OrgCode: number
  name: string
  type: string
  parentId: number | null
  img: string | null
  URL: string | null
  textColor: string | null
  isButton: boolean
  buttonColor: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function MenusPage() {
  const { user } = useAuth()
  const orgCode = user?.OrgCode || 1
  const [menus, setMenus] = useState<Menu[]>([])
  const [filteredMenus, setFilteredMenus] = useState<Menu[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [orgProfile, setOrgProfile] = useState<any>(null)
    const [bgColor, setBgColor] = useState<string>("#1e40af") // default = Tailwind blue-800


  useEffect(() => {
    fetchMenus()
    fetchOrgProfile()
  }, [])

  useEffect(() => {
    filterMenus()
  }, [menus, searchTerm, typeFilter, statusFilter])
  const fetchOrgProfile = async () => {
  try {
    const res = await fetch(`https://api.smartcorpweb.com/api/orgs/profile/${orgCode}`)
    const data = await res.json()
    setOrgProfile(data)
  } catch (error) {
    console.error("Error fetching org profile:", error)
  }
}

  const fetchMenus = async () => {
    try {
      setLoading(true)
      const response = await fetch(`https://api.smartcorpweb.com/api/menu?OrgCode=${orgCode}`)
      const data = await response.json()
      setMenus(data)
    } catch (error) {
      console.error("Error fetching menus:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterMenus = () => {
    let filtered = menus

    if (searchTerm) {
      filtered = filtered.filter(
        (menu) =>
          menu.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (menu.URL && menu.URL.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((menu) => menu.type === typeFilter)
    }

    if (statusFilter !== "all") {
      const isActive = statusFilter === "active"
      filtered = filtered.filter((menu) => menu.isActive === isActive)
    }

    setFilteredMenus(filtered)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this menu item?")) return

    try {
      const response = await fetch(`https://api.smartcorpweb.com/api/menu/${id}?OrgCode=${orgCode}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchMenus()
      } else {
        alert("Failed to delete menu item")
      }
    } catch (error) {
      console.error("Error deleting menu:", error)
      alert("Error deleting menu item")
    }
  }

  const getUniqueTypes = () => {
    const types = [...new Set(menus.map((menu) => menu.type).filter(Boolean))]
    return types
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading menus...</div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Menu Management</h1>
            <p className="text-muted-foreground">Manage your website navigation menus</p>
          </div>
        <div className="flex items-center gap-3">
  {/* All Preview Button */}
<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">
      <Eye className="w-4 h-4 mr-2" />
      Preview All
    </Button>
  </DialogTrigger>
  <DialogContent className="max-w-5xl">
    <DialogHeader>
      <DialogTitle>Menu Bar Preview</DialogTitle>
    </DialogHeader>

    {/* HEADER PREVIEW */}
    <div className="flex items-center justify-between border-b px-6 py-4  shadow-sm"
      style={{ backgroundColor: bgColor }}>
      {/* Logo */}
      <div className="flex items-center gap-3">
        {orgProfile?.Logo && (
          <img
            src={`https://api.smartcorpweb.com${orgProfile.Logo}`}
            alt={orgProfile.OrgName}
            className="h-12 object-contain"
          />
        )}
       
      </div>

      {/* Menus */}
      <div className="flex items-center gap-6">
        {[...menus]
          .filter(m => m.type === "main" && m.isActive)
          .sort((a, b) => a.id - b.id) // Ensure Home comes first
          .map(menu => {
         const submenus = menus
  .filter(m => m.type === "sub" && m.parentId === menu.id && m.isActive)
  .sort((a, b) => a.id - b.id)

            return (
              <div key={menu.id} className="relative group">
                {menu.isButton ? (
                  <a
                    href={menu.URL || "#"}
                    className="px-4 py-2 rounded text-white text-sm"
                    style={{ backgroundColor: menu.buttonColor || "#007bff" }}
                  >
                    {menu.name}
                  </a>
                ) : (
                  <a
                    href={menu.URL || "#"}
                    className="text-sm hover:underline"
                    style={{ color: menu.textColor || "#000" }}
                  >
                    {menu.img ? (
                      <img
                        src={`https://api.smartcorpweb.com${menu.img}`}
                        alt={menu.name}
                        className="h-5"
                      />
                    ) : (
                      menu.name
                    )}
                  </a>
                )}

                {/* SUBMENU DROPDOWN */}
                {submenus.length > 0 && (
                  <div className="absolute left-0 mt-2 hidden group-hover:block bg-white border rounded shadow-lg z-50 min-w-[150px]">
                    {submenus.map(sub => (
                      <a
                        key={sub.id}
                        href={sub.URL || "#"}
                        className="block px-4 py-2 text-sm hover:bg-gray-100"
                        style={{ color: sub.textColor || "#000" }}
                      >
                        {sub.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
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

  {/* Add Menu Item Button */}
  <Link href="/admin-cms/menubar/create">
    <Button>
      <Plus className="w-4 h-4 mr-2" />
      Add Menu Item
    </Button>
  </Link>
</div>

        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search by name or URL..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {getUniqueTypes().map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Menu Items ({filteredMenus.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                   <TableHead>ID</TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Text Color</TableHead>
                  <TableHead>Button</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                
                {filteredMenus.map((menu) => (
                  <TableRow key={menu.id}>
                    <TableCell>
                      <span className="text-muted-foreground text-sm">{menu.id}</span>
                    </TableCell>
                    <TableCell>
                      {menu.img ? (
                        <img
                          src={`https://api.smartcorpweb.com${menu.img}`}
                          alt={menu.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                          <EyeOff className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{menu.name}</span>
                      {menu.parentId && (
                        <div className="text-xs text-muted-foreground">
                          Parent ID: {menu.parentId}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {menu.type && <Badge variant="outline">{menu.type}</Badge>}
                    </TableCell>
                    <TableCell>
                      {menu.URL ? (
                        <a
                          href={menu.URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          {menu.URL.length > 30 ? `${menu.URL.substring(0, 30)}...` : menu.URL}
                        </a>
                      ) : (
                        <span className="text-muted-foreground text-sm">No URL</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {menu.textColor && (
                          <>
                            <div
                              className="w-4 h-4 rounded border"
                              style={{ backgroundColor: menu.textColor }}
                              title={`Color: ${menu.textColor}`}
                            />
                            <span className="text-sm">{menu.textColor}</span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {menu.isButton ? (
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">Button</Badge>
                          {menu.buttonColor && (
                            <div
                              className="w-4 h-4 rounded border"
                              style={{ backgroundColor: menu.buttonColor }}
                              title={`Button Color: ${menu.buttonColor}`}
                            />
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">No</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={menu.isActive ? "default" : "secondary"}>
                        {menu.isActive ? (
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
                      {new Date(menu.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                      
                        <Link href={`/admin-cms/menubar/edit/${menu.id}`}>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(menu.id)}
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

            {filteredMenus.length === 0 && (
              <div className="text-center py-8">
                <EyeOff className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No menu items found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || typeFilter !== "all" || statusFilter !== "all"
                    ? "Try adjusting your search or filters"
                    : "Create your first menu item to get started"}
                </p>
                {!searchTerm && typeFilter === "all" && statusFilter === "all" && (
                  <Link href="/admin-cms/menubar/create">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Menu Item
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