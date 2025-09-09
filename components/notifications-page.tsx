"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Bell, Search, Calendar, FileText, ExternalLink, ChevronUp, ChevronDown } from "lucide-react"
import { format, isAfter, isBefore } from "date-fns"
import { notificationApi } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"
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
}

type SortField = "NotiTitle" | "ValidFrom" | "ValidTo" | "status"
type SortDirection = "asc" | "desc"

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<SortField>("ValidFrom")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (user?.OrgCode) {
      fetchNotifications()
    }
  }, [user])

  const fetchNotifications = async () => {
    if (!user?.OrgCode) return

    try {
      setLoading(true)
      const data = await notificationApi.getByOrg(user.OrgCode.toString())
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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const filteredNotifications = notifications.filter(
    (notification) =>
      notification.NotiTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.NotiDesc?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getNotificationStatus = (notification: Notification) => {
    const now = new Date()
    const validFrom = new Date(notification.ValidFrom)
    const validTo = new Date(notification.ValidTo)

    if (isBefore(now, validFrom)) return { status: "upcoming", color: "bg-yellow-100 text-yellow-800" }
    if (isAfter(now, validTo)) return { status: "expired", color: "bg-gray-100 text-gray-800" }
    return { status: "active", color: "bg-green-100 text-green-800" }
  }

  const sortedNotifications = [...filteredNotifications].sort((a, b) => {
    let aValue, bValue

    if (sortField === "status") {
      aValue = getNotificationStatus(a).status
      bValue = getNotificationStatus(b).status
    } else {
      aValue = a[sortField]
      bValue = b[sortField]
    }

    if (sortField === "ValidFrom" || sortField === "ValidTo") {
      aValue = new Date(aValue as string)
      bValue = new Date(bValue as string)
    }

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc" 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue)
    }

    if (aValue instanceof Date && bValue instanceof Date) {
      return sortDirection === "asc" 
        ? aValue.getTime() - bValue.getTime() 
        : bValue.getTime() - aValue.getTime()
    }

    return sortDirection === "asc" 
      ? (aValue < bValue ? -1 : 1) 
      : (aValue > bValue ? -1 : 1)
  })

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronUp className="h-4 w-4 opacity-30" />
    return sortDirection === "asc" 
      ? <ChevronUp className="h-4 w-4" /> 
      : <ChevronDown className="h-4 w-4" />
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground">Stay updated with the latest announcements and updates</p>
        </div>

        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Bell className="h-4 w-4" />
          <span>{filteredNotifications.length} notifications</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center space-x-2"
      >
        <div className="relative flex-1 max-w-md">
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
        <div className="space-y-4">
          <div className="rounded-md border">
            <div className="grid grid-cols-12 gap-4 p-4 font-medium bg-muted/30">
              <div className="col-span-4">Title</div>
              <div className="col-span-2">Valid From</div>
              <div className="col-span-2">Valid To</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Actions</div>
            </div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse grid grid-cols-12 gap-4 p-4 border-t">
                <div className="col-span-4 h-5 bg-muted rounded"></div>
                <div className="col-span-2 h-5 bg-muted rounded"></div>
                <div className="col-span-2 h-5 bg-muted rounded"></div>
                <div className="col-span-2 h-5 bg-muted rounded"></div>
                <div className="col-span-2 h-8 w-16 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            {filteredNotifications.length > 0 ? (
              <div className="rounded-md border">
                <div className="grid grid-cols-12 gap-4 p-4 font-medium bg-muted/30">
                  <div 
                    className="col-span-4 flex items-center cursor-pointer"
                    onClick={() => handleSort("NotiTitle")}
                  >
                    Title
                    <SortIcon field="NotiTitle" />
                  </div>
                  <div 
                    className="col-span-2 flex items-center cursor-pointer"
                    onClick={() => handleSort("ValidFrom")}
                  >
                    Valid From
                    <SortIcon field="ValidFrom" />
                  </div>
                  <div 
                    className="col-span-2 flex items-center cursor-pointer"
                    onClick={() => handleSort("ValidTo")}
                  >
                    Valid To
                    <SortIcon field="ValidTo" />
                  </div>
                  <div 
                    className="col-span-2 flex items-center cursor-pointer"
                    onClick={() => handleSort("status")}
                  >
                    Status
                    <SortIcon field="status" />
                  </div>
                  <div className="col-span-2">Actions</div>
                </div>

                {sortedNotifications.map((notification, index) => {
                  const { status, color } = getNotificationStatus(notification)
                  const isActive = status === "active"

                  return (
                    <motion.div
                      key={notification.NotiId}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className={`grid grid-cols-12 gap-4 p-4 border-t hover:bg-muted/10 transition-colors ${isActive ? "bg-primary/5" : ""}`}
                    >
                      <div className="col-span-4">
                        <div className="font-medium">{notification.NotiTitle}</div>
                        {notification.NotiDesc && (
                          <div className="text-sm text-muted-foreground truncate">
                            {notification.NotiDesc}
                          </div>
                        )}
                      </div>
                      <div className="col-span-2">
                        {format(new Date(notification.ValidFrom), "MMM dd, yyyy")}
                      </div>
                      <div className="col-span-2">
                        {format(new Date(notification.ValidTo), "MMM dd, yyyy")}
                      </div>
                      <div className="col-span-2">
                        <Badge className={color}>
                          {status === "active" && "Active"}
                          {status === "upcoming" && "Upcoming"}
                          {status === "expired" && "Expired"}
                        </Badge>
                      </div>
                      <div className="col-span-2">
                        {notification.NotiFile && (
                          <a
                            href={notification.NotiFile}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline text-sm flex items-center gap-1"
                          >
                            View File
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                <Bell className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No notifications found</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? "No notifications match your search." : "There are no active notifications at the moment."}
                </p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}