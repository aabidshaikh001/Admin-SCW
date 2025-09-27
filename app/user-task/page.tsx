"use client"

import { useState, useEffect, ChangeEvent, FormEvent } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, Filter, CheckSquare, Clock, AlertCircle, Save, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useAuth } from "@/contexts/auth-context"

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

interface EditFormData {
  status: string
  remarks: string
}

const priorityColors = {
  High: "destructive",
  Medium: "default",
  Low: "secondary",
} as const

const statusOptions = [
  // { value: "pending", label: "Pending", color: "secondary" },
  // { value: "in-progress", label: "In Progress", color: "default" },
  { value: "completed", label: "Completed", color: "outline" },
  { value: "on-hold", label: "On Hold", color: "destructive" },
]

export default function UserTasksPage() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedPriority, setSelectedPriority] = useState<string>("all")
  const [editForm, setEditForm] = useState<{ [key: number]: EditFormData }>({})
  const [editMode, setEditMode] = useState<number | null>(null)
  const [remarkDialog, setRemarkDialog] = useState<{ open: boolean; taskId: number | null; newStatus: string }>({ 
    open: false, 
    taskId: null, 
    newStatus: "" 
  })
  const [tempRemarks, setTempRemarks] = useState("")
  const { toast } = useToast()

  const orgCode = user?.OrgCode || 1000
  const userId = user?.UserId

  useEffect(() => {
    if (userId) {
      fetchUserTasks()
    }
  }, [userId, orgCode])

  const fetchUserTasks = async () => {
    if (!userId) return
    
    try {
      setLoading(true)
      const response = await fetch(`https://api.smartcorpweb.com/api/amtrantasks/org/${orgCode}/user/${userId}`)

      if (!response.ok) {
        throw new Error("Failed to fetch tasks")
      }

      const result = await response.json()
      setTasks(result.data || [])
      
      // Initialize edit form data
      const initialEditForm: { [key: number]: EditFormData } = {}
      result.data?.forEach((task: Task) => {
        initialEditForm[task.id] = {
          status: task.status,
          remarks: task.remarks || ""
        }
      })
      setEditForm(initialEditForm)
    } catch (error) {
      console.error("Error fetching tasks:", error)
      toast({
        title: "Error",
        description: "Failed to fetch your tasks",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = (taskId: number, field: keyof EditFormData, value: string | number) => {
    setEditForm(prev => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        [field]: value
      }
    }))
  }

  const handleStatusSelect = (taskId: number, newStatus: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    // If status is changing to "completed" or "on-hold", open remarks dialog
    if ((newStatus === "completed" || newStatus === "on-hold") && task.status !== newStatus) {
      setTempRemarks(editForm[taskId]?.remarks || "")
      setRemarkDialog({
        open: true,
        taskId,
        newStatus
      })
    } else {
      // For other status changes, update directly
      handleStatusChange(taskId, 'status', newStatus)
    }
  }

  const handleSaveWithRemarks = async () => {
    const { taskId, newStatus } = remarkDialog
    if (!taskId) return

    // Update the form data with new status and remarks
    setEditForm(prev => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        status: newStatus,
        remarks: tempRemarks
      }
    }))

    // Close dialog first
    setRemarkDialog({ open: false, taskId: null, newStatus: "" })

    // Then save the task
    await performTaskUpdate(taskId, newStatus, tempRemarks)
  }

  const handleSave = async (taskId: number) => {
    if (!editForm[taskId]) return

    const { status, remarks } = editForm[taskId]
    await performTaskUpdate(taskId, status, remarks)
  }

  const performTaskUpdate = async (taskId: number, status: string, remarks: string) => {
    setUpdating(taskId)
    try {
      const updateData = {
        status: status,
        remarks: remarks,
        TranByUpdate: user?.UserName || "user",
        // Include required fields to avoid NULL errors
        title: tasks.find(t => t.id === taskId)?.title || "Task",
        category: tasks.find(t => t.id === taskId)?.category || "General",
        priority: tasks.find(t => t.id === taskId)?.priority || "Medium",
        OrgCode: orgCode,
        UserId: userId
      }

      const response = await fetch(`https://api.smartcorpweb.com/api/amtrantasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update task")
      }

      // Update local state
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, status: status, remarks: remarks }
          : task
      ))

      setEditMode(null)
      toast({
        title: "Success",
        description: "Task updated successfully",
      })
    } catch (error) {
      console.error("Error updating task:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update task",
        variant: "destructive",
      })
    } finally {
      setUpdating(null)
    }
  }

  const handleCancel = (taskId: number) => {
    // Reset to original values
    const task = tasks.find(t => t.id === taskId)
    if (task) {
      setEditForm(prev => ({
        ...prev,
        [taskId]: {
          status: task.status,
          remarks: task.remarks || ""
        }
      }))
    }
    setEditMode(null)
  }


  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.category.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = selectedStatus === "all" || task.status.toString() === selectedStatus
    const matchesPriority = selectedPriority === "all" || task.priority === selectedPriority

    return matchesSearch && matchesStatus && matchesPriority
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

  const getStatusLabel = (status: string) => {
    const statusOption = statusOptions.find(opt => opt.value === status)
    return statusOption ? statusOption.label : "Unknown"
  }

  const getStatusColor = (status: string) => {
    const statusOption = statusOptions.find(opt => opt.value === status)
    return statusOption ? statusOption.color as "secondary" | "default" | "outline" | "destructive" : "secondary"
  }

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString()
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your tasks...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Tasks</h1>
            <p className="text-muted-foreground mt-2">View and update your assigned tasks</p>
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
          </Badge>
        </div>

        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <AlertDescription className="text-blue-800">
            You can only update the status and remarks for your tasks. Click on any task row to edit.
            Remarks are required when changing status to "Completed" or "On Hold".
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Task List</CardTitle>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-40">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value.toString()}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task Details</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Remarks</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="text-muted-foreground">
                          <CheckSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          {searchTerm || selectedStatus !== "all" || selectedPriority !== "all"
                            ? "No tasks found matching your filters."
                            : "No tasks assigned to you yet."}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTasks.map((task) => (
                      <TableRow 
                        key={task.id} 
                       className={`cursor-pointer hover:bg-muted/50 
    ${editMode === task.id ? 'bg-blue-50' : ''} 
    ${isOverdue(task.dueDate) ? 'border-l-4 border-l-destructive' : ''} 
    ${task.status === "completed" ? "bg-green-100" : ""} 
    ${task.status === "on-hold" ? "bg-red-100" : ""}`
  }
                        onClick={() => !editMode && setEditMode(task.id)}
                      >
                        <TableCell>
                          <div>
                            <div className="font-medium">{task.title}</div>
                            {task.description && (
                              <div className="text-sm text-muted-foreground line-clamp-2">{task.description}</div>
                            )}
                            {isOverdue(task.dueDate) && (
                              <Badge variant="destructive" className="mt-1 text-xs">
                                Overdue
                              </Badge>
                            )}
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
                          {editMode === task.id ? (
                            <Select
                              value={editForm[task.id]?.status?.toString() || task.status.toString()}
                              onValueChange={(value: string) => handleStatusSelect(task.id, value)}
                                disabled={task.status === "completed" || task.status === "on-hold"} // ✅ disable select if completed
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {statusOptions.map((status) => (
                                  <SelectItem key={status.value} value={status.value.toString()}>
                                    {status.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge variant={getStatusColor(task.status)} className="w-fit">
                              {getStatusLabel(task.status)}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className={isOverdue(task.dueDate) ? "text-destructive font-medium" : "text-muted-foreground"}>
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}
                        </TableCell>
                        <TableCell>
                          {task.remarks || "No remarks"}
                        </TableCell>
                        <TableCell className="text-right">
                          {editMode === task.id ? (
                            <div className="flex gap-2 justify-end">
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleSave(task.id)
                                }}
                                disabled={updating === task.id}
                                className="flex items-center gap-1"
                              >
                                <Save className="w-3 h-3" />
                                {updating === task.id ? "Saving..." : "Save"}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleCancel(task.id)
                                }}
                                disabled={updating === task.id}
                                className="flex items-center gap-1"
                              >
                                <X className="w-3 h-3" />
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditMode(task.id)
                              }}
                              disabled={task.status === "completed" || task.status === "on-hold" 
                              } // ✅ disable for completed tasks
                            >
                              Edit
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Remarks Dialog */}
        <Dialog open={remarkDialog.open} >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Remarks</DialogTitle>
              <DialogDescription>
                Remarks are required when changing status to{" "}
                <strong>{remarkDialog.newStatus === "completed" ? "Completed" : "On Hold"}</strong>.
                Please provide details about the task completion or reason for putting it on hold.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                value={tempRemarks}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setTempRemarks(e.target.value)}
                placeholder="Enter your remarks here..."
                className="min-h-[100px]"
              />
              {!tempRemarks.trim() && (
                <Alert variant="destructive" className="py-2">
                  <AlertDescription>
                    Remarks are required for this status change.
                  </AlertDescription>
                </Alert>
              )}
            </div>
            <DialogFooter>
             
              <Button 
                onClick={handleSaveWithRemarks}
                disabled={!tempRemarks.trim()}
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}