"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Plus, Edit, Trash2, Search, Bell, Users, Building2 } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { notificationApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface Notification {
  NotiId: number
  NotiType: number
  OrgCode: number
  NotiTitle: string
  ValidFrom: string
  ValidTo: string
  NotiFile?: string
  NotiDesc?: string
  IsDeleted: boolean
  TransDate: string
  TransBy: string
  TranDateUpdate?: string
  TranByUpdate?: string
}

interface Organization {
  OrgID: number
  OrgCode: number
  OrgName: string
}

export default function NotificationManager() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null)
  const [formData, setFormData] = useState({
    NotiType: 1,
    OrgCode: 0,
    NotiTitle: "",
    ValidFrom: undefined as Date | undefined,
    ValidTo: undefined as Date | undefined,
    NotiFile: "",
    NotiDesc: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchNotifications()
    fetchOrganizations()
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const data = await notificationApi.getAll()
      setNotifications(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching notifications:", error)
      toast({
        title: "Error",
        description: "Failed to fetch notifications",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchOrganizations = async () => {
    try {
      const data = await notificationApi.getOrgList()
      setOrganizations(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching organizations:", error)
    }
  }

  const handleCreate = async () => {
    // Validate dates
    if (!formData.ValidFrom || !formData.ValidTo) {
      toast({
        title: "Error",
        description: "Please select both Valid From and Valid To dates",
        variant: "destructive",
      })
      return
    }

    try {
      await notificationApi.create(formData)
      toast({
        title: "Success",
        description: "Notification created successfully",
      })
      setIsCreateModalOpen(false)
      resetForm()
      fetchNotifications()
    } catch (error) {
      console.error("Error creating notification:", error)
      toast({
        title: "Error",
        description: "Failed to create notification",
        variant: "destructive",
      })
    }
  }

  const handleEdit = async () => {
    if (!editingNotification) return

    // Validate dates
    if (!formData.ValidFrom || !formData.ValidTo) {
      toast({
        title: "Error",
        description: "Please select both Valid From and Valid To dates",
        variant: "destructive",
      })
      return
    }

    try {
      await notificationApi.update(editingNotification.NotiId.toString(), formData)
      toast({
        title: "Success",
        description: "Notification updated successfully",
      })
      setIsEditModalOpen(false)
      setEditingNotification(null)
      resetForm()
      fetchNotifications()
    } catch (error) {
      console.error("Error updating notification:", error)
      toast({
        title: "Error",
        description: "Failed to update notification",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this notification?")) return
    try {
      await notificationApi.delete(id.toString())
      toast({
        title: "Success",
        description: "Notification deleted successfully",
      })
      fetchNotifications()
    } catch (error) {
      console.error("Error deleting notification:", error)
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      NotiType: 1,
      OrgCode: 0,
      NotiTitle: "",
      ValidFrom: undefined,
      ValidTo: undefined,
      NotiFile: "",
      NotiDesc: "",
    })
  }

  const openEditModal = (notification: Notification) => {
    setEditingNotification(notification)
    setFormData({
      NotiType: notification.NotiType,
      OrgCode: notification.OrgCode,
      NotiTitle: notification.NotiTitle,
      ValidFrom: new Date(notification.ValidFrom),
      ValidTo: new Date(notification.ValidTo),
      NotiFile: notification.NotiFile || "",
      NotiDesc: notification.NotiDesc || "",
    })
    setIsEditModalOpen(true)
  }

  const filteredNotifications = notifications.filter(
    (notification) =>
      notification.NotiTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.NotiDesc?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getOrgName = (orgCode: number) => {
    const org = organizations.find((o) => o.OrgCode === orgCode)
    return org ? org.OrgName : `Org ${orgCode}`
  }

  const NotificationForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Notification Title</Label>
            <Input
              id="title"
              value={formData.NotiTitle}
              onChange={(e) => setFormData({ ...formData, NotiTitle: e.target.value })}
              placeholder="Enter notification title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Notification Type</Label>
            <Select
              value={formData.NotiType.toString()}
              onValueChange={(value) => setFormData({ ...formData, NotiType: Number.parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select notification type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">All Organizations</SelectItem>
                <SelectItem value="2">Individual Organization</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.NotiType === 2 && (
            <div className="space-y-2">
              <Label htmlFor="org">Organization</Label>
              <Select
                value={formData.OrgCode.toString()}
                onValueChange={(value) => setFormData({ ...formData, OrgCode: Number.parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select organization" />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.OrgCode} value={org.OrgCode.toString()}>
                      {org.OrgName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Valid From</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.ValidFrom && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.ValidFrom ? format(formData.ValidFrom, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.ValidFrom}
                    onSelect={(date) => setFormData({ ...formData, ValidFrom: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Valid To</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.ValidTo && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.ValidTo ? format(formData.ValidTo, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.ValidTo}
                    onSelect={(date) => setFormData({ ...formData, ValidTo: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Attachment File (Optional)</Label>
            <Input
              id="file"
              value={formData.NotiFile}
              onChange={(e) => setFormData({ ...formData, NotiFile: e.target.value })}
              placeholder="Enter file path or URL"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.NotiDesc}
              onChange={(e) => setFormData({ ...formData, NotiDesc: e.target.value })}
              placeholder="Enter notification description"
              rows={4}
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2">
        <Button
          variant="outline"
          onClick={() => {
            if (isEdit) {
              setIsEditModalOpen(false)
              setEditingNotification(null)
            } else {
              setIsCreateModalOpen(false)
            }
            resetForm()
          }}
        >
          Cancel
        </Button>
        <Button onClick={isEdit ? handleEdit : handleCreate}>{isEdit ? "Update" : "Create"} Notification</Button>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">Manage Notifications</h1>
         
        </div>

        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
           System Notification
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>System Notification(New)</DialogTitle>
           
            </DialogHeader>
            <NotificationForm />
          </DialogContent>
        </Dialog>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center space-x-2"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredNotifications.map((notification, index) => (
              <motion.div
                key={notification.NotiId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold text-foreground line-clamp-2">
                          {notification.NotiTitle}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {notification.NotiType === 1 ? (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                              <Users className="mr-1 h-3 w-3" />
                              All Organizations
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-blue-200 text-blue-700">
                              <Building2 className="mr-1 h-3 w-3" />
                              {getOrgName(notification.OrgCode)}
                            </Badge>
                          )}
                        </CardDescription>
                      </div>
                      <Bell className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {notification.NotiDesc && (
                      <p className="text-sm text-muted-foreground line-clamp-3">{notification.NotiDesc}</p>
                    )}

                    <div className="space-y-2 text-xs text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Valid From:</span>
                        <span>{format(new Date(notification.ValidFrom), "MMM dd, yyyy")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Valid To:</span>
                        <span>{format(new Date(notification.ValidTo), "MMM dd, yyyy")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Created:</span>
                        <span>{format(new Date(notification.TransDate), "MMM dd, yyyy")}</span>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-2">
                      <Button variant="outline" size="sm" onClick={() => openEditModal(notification)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      {/* <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(notification.NotiId)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button> */}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {!loading && filteredNotifications.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
          <Bell className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No notifications found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? "No notifications match your search." : "Get started by creating your first notification."}
          </p>
          {!searchTerm && (
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
           Save
            </Button>
          )}
        </motion.div>
      )}

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Notification</DialogTitle>
            <DialogDescription>Update the notification details</DialogDescription>
          </DialogHeader>
          <NotificationForm isEdit />
        </DialogContent>
      </Dialog>
    </div>
  )
}
