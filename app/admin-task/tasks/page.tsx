"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, Filter, CheckSquare, Clock, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useAuth } from "@/contexts/auth-context" // Make sure this path is correct

interface Task {
  id: number
  OrgCode: number
  UserId: number
  category: string
  title: string
  description?: string
  dueDate?: string
  priority: string
  remarks?: string
  status: string
  IsActive: boolean
  TransDate: string
  UserName?: string
}

interface User {
  UserId: number
  UserName: string
  UserEmail?: string
}
const priorityColors = {
  High: "destructive",
  Medium: "default",
  Low: "secondary",
} as const



const statusColors = {
  "pending": "secondary",   // gray
  "in-progress": "default", // neutral/blue
  "completed": "outline",   // outlined
  "on-hold": "destructive", // red
} as const


export default function TasksPage() {
    const { user } = useAuth()
            const orgCode = user?.OrgCode || 1000
  const [tasks, setTasks] = useState<Task[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedPriority, setSelectedPriority] = useState<string>("all")
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const { toast } = useToast()

  // Mock OrgCode - in real app this would come from auth context
 

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [usersResponse, tasksResponse] = await Promise.all([
        fetch(`https://api.smartcorpweb.com/api/amtrantasks/users/${orgCode}`),
        fetch(`https://api.smartcorpweb.com/api/amtrantasks/org/${orgCode}`),
      ])

      if (!usersResponse.ok || !tasksResponse.ok) {
        throw new Error("Failed to fetch data")
      }

      const usersData = await usersResponse.json()
      const tasksData = await tasksResponse.json()

     setUsers(Array.isArray(usersData) ? usersData : usersData.data || [])

    setTasks(tasksData.data || []) // ✅ safe fallback
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "Failed to fetch tasks",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`https://api.smartcorpweb.com/api/amtrantasks/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          TranByDel: "admin", // In real app, get from auth context
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to delete task")
      }

      setTasks((prev) => prev.filter((task) => task.id !== id))
      toast({
        title: "Success",
        description: "Task deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting task:", error)
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      })
    }
    setDeleteId(null)
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.category.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesUser = selectedUser === "all" || task.UserId.toString() === selectedUser
    const matchesStatus = selectedStatus === "all" || task.status.toString() === selectedStatus
    const matchesPriority = selectedPriority === "all" || task.priority === selectedPriority

    return matchesSearch && matchesUser && matchesStatus && matchesPriority
  })

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "High":
        return <AlertCircle className="w-4 h-4" />
      case "Medium":
        return <Clock className="w-4 h-4" />
      case "Low":
        return <CheckSquare className="w-4 h-4" />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading tasks...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout>
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Task Management</h1>
         
        </div>
         <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
        <Link href="/admin-task/tasks/create">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New
          </Button>
        </Link>
      </div>

      <Card>
       
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="text-muted-foreground">
                        <CheckSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        {searchTerm || selectedUser !== "all" || selectedStatus !== "all" || selectedPriority !== "all"
                          ? "No tasks found matching your filters."
                          : "No tasks found."}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{task.title}</div>
                          {task.description && (
                            <div className="text-sm text-muted-foreground line-clamp-2">{task.description}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                            {users.find((u) => u.UserId.toString() === task.UserId.toString())?.UserName || "Unknown User"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{task.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={priorityColors[task.priority as keyof typeof priorityColors] || "secondary"}
                          className="flex items-center gap-1 w-fit"
                        >
                          {getPriorityIcon(task.priority)}
                          {task.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={statusColors[task.status as keyof typeof statusColors] || "secondary"}
                          className="w-fit"
                        >
                          {task.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(task.TransDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            
                            <DropdownMenuItem asChild>
                              <Link href={`/admin-task/tasks/edit/${task.id}`}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            {/* <DropdownMenuItem onClick={() => setDeleteId(task.id)} className="text-destructive">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem> */}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </DashboardLayout>
  )
}
