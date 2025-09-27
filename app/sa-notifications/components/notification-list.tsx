"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Edit,  Search, Bell, Users, Building2, ChevronUp, ChevronDown } from "lucide-react"
import { format } from "date-fns"
import { notificationApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

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

type SortField = "NotiTitle" | "ValidFrom" | "ValidTo" | "TransDate" | "OrgCode"
type SortDirection = "asc" | "desc"

export default function NotificationList() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<SortField>("TransDate")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const { toast } = useToast()
  const router = useRouter()

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

  const sortedNotifications = [...filteredNotifications].sort((a, b) => {
    let aValue, bValue

    if (sortField === "OrgCode") {
      aValue = getOrgName(a.OrgCode)
      bValue = getOrgName(b.OrgCode)
    } else {
      aValue = a[sortField]
      bValue = b[sortField]
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

  const getOrgName = (orgCode: number) => {
    const org = organizations.find((o) => o.OrgCode === orgCode)
    return org ? org.OrgName : `Org ${orgCode}`
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronUp className="h-4 w-4 opacity-30" />
    return sortDirection === "asc" 
      ? <ChevronUp className="h-4 w-4" /> 
      : <ChevronDown className="h-4 w-4" />
  }

  return (
    <div className="space-y-6 p-4 max-w-6xl mx-auto">
      <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  className="flex flex-col sm:flex-row items-center justify-between gap-4"
>
  {/* Title */}
  <h1 className="text-2xl font-bold text-foreground whitespace-nowrap">
    System Updates
  </h1>

  {/* Search */}
  <div className="relative flex-1 max-w-md w-full">
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
    <Input
      placeholder="Search notifications..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="pl-10"
    />
  </div>

  {/* New button */}
  <Button
    className="bg-primary hover:bg-primary/90 whitespace-nowrap"
    onClick={() => router.push("/sa-notifications/add")}
  >
    <Plus className="mr-2 h-4 w-4" />
    New
  </Button>
</motion.div>

      {loading ? (
        <div className="space-y-4">
          <div className="rounded-md border">
            <div className="grid grid-cols-10 gap-4 p-4 font-medium bg-muted/30">
              <div className="col-span-3">Title</div>
              <div className="col-span-2">Organization</div>
              <div className="col-span-2">Valid From</div>
              <div className="col-span-2">Valid To</div>
        
              <div className="col-span-1">Actions</div>
            </div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse grid grid-cols-10 gap-4 p-4 border-t">
                <div className="col-span-3 h-5 bg-muted rounded"></div>
                <div className="col-span-2 h-5 bg-muted rounded"></div>
                <div className="col-span-2 h-5 bg-muted rounded"></div>
                <div className="col-span-2 h-5 bg-muted rounded"></div>
                <div className="col-span-2 h-5 bg-muted rounded"></div>
                <div className="col-span-1 h-8 w-16 bg-muted rounded"></div>
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
                <div className="grid grid-cols-10 gap-4 p-4 font-medium bg-muted/30">
                  <div 
                    className="col-span-3 flex items-center cursor-pointer"
                    onClick={() => handleSort("NotiTitle")}
                  >
                    Title
                    <SortIcon field="NotiTitle" />
                  </div>
                  <div 
                    className="col-span-2 flex items-center cursor-pointer"
                    onClick={() => handleSort("OrgCode")}
                  >
                    Organization
                    <SortIcon field="OrgCode" />
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
                
                  <div className="col-span-1">Actions</div>
                </div>

                {sortedNotifications.map((notification, index) => (
                  <motion.div
                    key={notification.NotiId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="grid grid-cols-10 gap-4 p-4 border-t hover:bg-muted/10 transition-colors"
                  >
                    <div className="col-span-3">
                      <div className="font-medium">{notification.NotiTitle}</div>
                      {notification.NotiDesc && (
                        <div className="text-sm text-muted-foreground truncate">
                          {notification.NotiDesc}
                        </div>
                      )}
                    </div>
                    <div className="col-span-2">
                      {notification.NotiType === 1 ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <Users className="mr-1 h-3 w-3" />
                          All Organizations
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border border-blue-200 text-blue-700">
                          <Building2 className="mr-1 h-3 w-3" />
                          {getOrgName(notification.OrgCode)}
                        </span>
                      )}
                    </div>
                    <div className="col-span-2">
                      {format(new Date(notification.ValidFrom), "MMM dd, yyyy")}
                    </div>
                    <div className="col-span-2">
                      {format(new Date(notification.ValidTo), "MMM dd, yyyy")}
                    </div>
                  
                    <div className="col-span-1 flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/sa-notifications/edit/${notification.NotiId}`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                <Bell className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No notifications found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? "No notifications match your search." : "Get started by creating your first notification."}
                </p>
                {!searchTerm && (
                  <Button onClick={() => router.push("/sa-notifications/add")}>
                    <Plus className="mr-2 h-4 w-4" />
                 Save
                  </Button>
                )}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}