"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { Search, Plus, Edit, Trash2, Eye } from "lucide-react"
import {DashboardLayout} from "@/components/dashboard-layout"
import { toast } from 'react-toastify';
interface OrgModule {
  OrgModuleId: number
  ModuleId: number
  OrgCode: number
  ModuleCode: string
  Status: string
  ModuleName: string
  OrgName: string
  TransDate: string
  TransBy: string
}

export default function ModulesPage() {
  const [orgModules, setOrgModules] = useState<OrgModule[]>([])
  const [filteredModules, setFilteredModules] = useState<OrgModule[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrgModules()
  }, [])

  useEffect(() => {
    const filtered = orgModules.filter(
      (module) =>
        module.ModuleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.OrgName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.Status.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredModules(filtered)
  }, [searchTerm, orgModules])

  const fetchOrgModules = async () => {
    try {
      const response = await fetch("https://api.smartcorpweb.com/api/assignmodules/org-modules")
      const data = await response.json()
      if (data.success) {
        setOrgModules(data.data)
        setFilteredModules(data.data)
      }
    } catch (error) {
      console.error("Error fetching org modules:", error)
   
      toast.error("Failed to fetch module assignments");
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`https://api.smartcorpweb.com/api/assignmodules/org-modules/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ TransBy: "Admin" }),
      })

      const data = await response.json()
      if (data.success) {
       
        toast.success("Module assignment deleted successfully");
        fetchOrgModules()
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      console.error("Error deleting module:", error)
    
      toast.error("Failed to delete module assignment");
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
       <div className="flex items-center justify-between">
  <div className="flex items-center gap-4">
    <h1 className="text-2xl font-bold text-balance">Module Assignments</h1>
    <div className="relative">
      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search assignments..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-10 w-64"
      />
    </div>
  </div>

  <Button asChild>
    <Link href="/org/modules/add">
      <Plus className="mr-2 h-4 w-4" />
      New
    </Link>
  </Button>
</div>

       

        <Card>
          
        
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Module</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Module Code</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned Date</TableHead>
                    <TableHead>Assigned By</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredModules.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        No module assignments found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredModules.map((module) => (
                      <TableRow key={module.ModuleId}>
                        <TableCell className="font-medium">{module.ModuleName}</TableCell>
                        <TableCell>{module.OrgName}</TableCell>
                        <TableCell>
                          <code className="bg-muted px-2 py-1 rounded text-sm">{module.ModuleCode}</code>
                        </TableCell>
                        <TableCell>
                          <Badge variant={module.Status === "Active" ? "default" : "secondary"}>{module.Status}</Badge>
                        </TableCell>
                        <TableCell>{new Date(module.TransDate).toLocaleDateString()}</TableCell>
                        <TableCell>{module.TransBy}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                          
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/org/modules/edit/${module.ModuleId}`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Assignment</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this module assignment? This action cannot be
                                    undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(module.ModuleId)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          
        </Card>
      </div>
    </DashboardLayout>
  )
}
