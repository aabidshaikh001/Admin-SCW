"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Edit, Trash2 } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"

interface KeyPointer {
  Id: number
  OrgCode: number
  Text: string
  TextColor: string
  Counter: number
  CounterColor: string
  Image: string | null
  IsActive: boolean
  CreatedAt: string
  UpdatedAt: string
}

export default function KeyPointersPage() {
  const { user } = useAuth()
  const [keyPointers, setKeyPointers] = useState<KeyPointer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    fetchKeyPointers()
  }, [user?.OrgCode])

  const fetchKeyPointers = async () => {
    try {
      setLoading(true)
      const orgCode = user?.OrgCode
      if (!orgCode) return
      const response = await fetch(`https://api.smartcorpweb.com/api/keypointer?OrgCode=${orgCode}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      if (response.ok) {
        const data = await response.json()
        // Make sure image URLs are absolute
        const updatedData = data.map((kp: KeyPointer) => ({
          ...kp,
          Image: kp.Image ? `https://api.smartcorpweb.com${kp.Image}` : null,
        }))
        setKeyPointers(updatedData)
      }
    } catch (error) {
      console.error("Error fetching key pointers:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this key pointer?")) return
    try {
      const orgCode = user?.OrgCode
      if (!orgCode) return
      const response = await fetch(`https://api.smartcorpweb.com/api/keypointer/${id}?OrgCode=${orgCode}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      if (response.ok) fetchKeyPointers()
    } catch (error) {
      console.error("Error deleting key pointer:", error)
    }
  }

  const filteredKeyPointers = keyPointers.filter((kp) => {
    const matchesSearch = kp.Text.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && kp.IsActive) ||
      (statusFilter === "inactive" && !kp.IsActive)
    return matchesSearch && matchesStatus
  })

  if (loading) return <div>Loading...</div>

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Key Pointers</h1>
            <p className="text-muted-foreground">Manage your key result area pointers</p>
          </div>
          <Link href="/admin-kra/keypointers/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Key Pointer
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search key pointers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
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
            <CardTitle>Key Pointers ({filteredKeyPointers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Text</TableHead>
                  <TableHead>Counter</TableHead>
                  <TableHead>Colors</TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredKeyPointers.map((kp) => (
                  <TableRow key={kp.Id}>
                    <TableCell>
                      <div className="font-medium" style={{ color: kp.TextColor }}>
                        {kp.Text}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-lg" style={{ color: kp.CounterColor }}>
                        {kp.Counter}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <div
                          className="w-4 h-4 rounded border"
                          style={{ backgroundColor: kp.TextColor }}
                          title={`Text: ${kp.TextColor}`}
                        />
                        <div
                          className="w-4 h-4 rounded border"
                          style={{ backgroundColor: kp.CounterColor }}
                          title={`Counter: ${kp.CounterColor}`}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      {kp.Image ? (
                        <img
                          src={kp.Image}
                          alt="Key pointer"
                          className="w-8 h-8 rounded object-cover"
                        />
                      ) : (
                        <span className="text-muted-foreground text-sm">No image</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={kp.IsActive ? "default" : "secondary"}>
                        {kp.IsActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(kp.CreatedAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Link href={`/admin-kra/keypointers/edit/${kp.Id}`}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(kp.Id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredKeyPointers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="text-muted-foreground">
                        {searchTerm || statusFilter !== "all"
                          ? "No key pointers match your filters"
                          : "No key pointers found"}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
