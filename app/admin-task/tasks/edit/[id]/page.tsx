"use client"

import { useState, useEffect, ChangeEvent, FormEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save, Calendar, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useAuth } from "@/contexts/auth-context" // Make sure this path is correct

interface User {
  UserId: number
  UserName: string
  UserEmail?: string
}


interface Task {
  id: number
  UserId: number
  category: string
  title: string
  description: string
  dueDate: string
  priority: string
  remarks: string
  status: string
  IsActive: boolean
}

interface TaskFormData {
  category: string
  title: string
  description: string
  dueDate: string
  priority: string
  remarks: string
  status: string
  TranByUpdate: string
  IsActive: boolean
}

type FormField = keyof TaskFormData

export default function EditTaskPage({ params }: { params: { id: string } }) {
    const { user } = useAuth()
            const orgCode = user?.OrgCode || 1000
  const router = useRouter()
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [usersLoading, setUsersLoading] = useState(true)

 
  const [formData, setFormData] = useState<TaskFormData>({
    category: "",
    title: "",
    description: "",
    dueDate: "",
    priority: "Medium",
    remarks: "",
     status: "pending",
    TranByUpdate: "admin", // In real app, get from auth context
    IsActive: true,
  })

  const [originalTask, setOriginalTask] = useState<Task | null>(null)
  const [errors, setErrors] = useState<Partial<Record<keyof TaskFormData, string>>>({})

  useEffect(() => {
    fetchTaskData()
    fetchUsers()
  }, [params.id])

  const fetchTaskData = async () => {
    try {
      setPageLoading(true)
      const response = await fetch(`https://api.smartcorpweb.com/api/amtrantasks/${params.id}`)

      if (!response.ok) {
        throw new Error("Failed to fetch task")
      }

      const result = await response.json()
      const task: Task = result.data

      setOriginalTask(task)
      setFormData({
        category: task.category || "",
        title: task.title || "",
        description: task.description || "",
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
        priority: task.priority || "Medium",
        remarks: task.remarks || "",
        status: task.status || "pending",
        TranByUpdate: "admin",
        IsActive: task.IsActive !== undefined ? task.IsActive : true,
      })
    } catch (error) {
      console.error("Error fetching task:", error)
      toast({
        title: "Error",
        description: "Failed to fetch task details",
        variant: "destructive",
      })
      router.push("/admin-task/tasks")
    } finally {
      setPageLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      setUsersLoading(true)
      const response = await fetch(`https://api.smartcorpweb.com/api/amtrantasks/users/${orgCode}`)

      if (!response.ok) {
        throw new Error("Failed to fetch users")
      }

      const usersData: User[] = await response.json()
      setUsers(usersData)
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      })
    } finally {
      setUsersLoading(false)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof TaskFormData, string>> = {}

    if (!formData.title.trim()) {
      newErrors.title = "Title is required"
    }

    if (!formData.category.trim()) {
      newErrors.category = "Category is required"
    }

    if (!formData.priority) {
      newErrors.priority = "Priority is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const submitData = {
        ...formData,
        dueDate: formData.dueDate || null,
      }

      const response = await fetch(`https://api.smartcorpweb.com/api/amtrantasks/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      })

      if (!response.ok) {
        throw new Error("Failed to update task")
      }

      toast({
        title: "Success",
        description: "Task updated successfully",
      })

      router.push("/admin-task/tasks")
    } catch (error) {
      console.error("Error updating task:", error)
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: FormField, value: string | number | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }))
    }
  }

  if (pageLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading task details...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout>
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
      
        <div>
          <h1 className="text-2xl font-bold text-foreground">Task(Update)</h1>
        
        </div>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Task Details</CardTitle>
              {originalTask && (
                <div className="text-sm text-muted-foreground">
                  Assigned to: {users.find((u) => u.UserId === originalTask.UserId)?.UserName || "Unknown User"}
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  Task Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("title", e.target.value)}
                  placeholder="Enter task title"
                  className={errors.title ? "border-destructive" : ""}
                />
                {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">
                  Category <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("category", e.target.value)}
                  placeholder="e.g., Development, Marketing, Support"
                  className={errors.category ? "border-destructive" : ""}
                />
                {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleInputChange("description", e.target.value)}
                  placeholder="Provide detailed task description..."
                  rows={4}
                />
              </div>

              {/* Priority and Due Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">
                    Priority <span className="text-destructive">*</span>
                  </Label>
                  <Select value={formData.priority} onValueChange={(value: string) => handleInputChange("priority", value)}>
                    <SelectTrigger className={errors.priority ? "border-destructive" : ""}>
                      <AlertCircle className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.priority && <p className="text-sm text-destructive">{errors.priority}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="dueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("dueDate", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

             Status
              <div className="space-y-2">
                <Label htmlFor="status">Initial Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: string) => handleInputChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    {/* <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem> */}
                    <SelectItem value="on-hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
              </div>

   {/* Remarks */}
              <div className="space-y-2">
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea
                  id="remarks"
                  value={formData.remarks}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleInputChange("remarks", e.target.value)}
                  placeholder="Additional notes or instructions..."
                  rows={3}
                  readOnly
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.IsActive}
                  onCheckedChange={(checked: boolean) => handleInputChange("IsActive", checked)}
                />
                <Label htmlFor="isActive">Active Task</Label>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center gap-4 mt-8">
            <Button type="submit" disabled={loading} className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              {loading ? "Updating..." : "Update Task"}
            </Button>
            <Link href="/admin-task/tasks">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
    </DashboardLayout>
  )
}