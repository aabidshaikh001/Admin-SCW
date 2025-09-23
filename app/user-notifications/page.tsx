"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Bell, Download, Calendar, FileText, User, ChevronUp, ChevronDown } from "lucide-react"
import { format, parseISO, isAfter, isBefore } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useAuth } from "@/contexts/auth-context"

interface Notification {
  NotiId: number
  OrgCode: number
  NotiType: number
  UserId: number
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
  TranDateDel?: string
  TranByDel?: string
}

type SortField = "NotiTitle" | "ValidFrom" | "ValidTo" | "TransDate" | "NotiType"
type SortDirection = "asc" | "desc"

export default function UserNotificationsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<SortField>("TransDate")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const { toast } = useToast()

  useEffect(() => {
    if (user?.UserId && user?.OrgCode) {
      fetchUserNotifications()
    }
  }, [user?.UserId, user?.OrgCode])

  const fetchUserNotifications = async () => {
    try {
      setLoading(true)
      const response = await fetch(`https://api.smartcorpweb.com/api/admin-updates/user/${user?.UserId}/${user?.OrgCode}`)
      
      if (!response.ok) {
        throw new Error("Failed to fetch notifications")
      }
      
      const data = await response.json()
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

  useEffect(() => {
    filterAndSortNotifications()
  }, [notifications, searchTerm, sortField, sortDirection])

  const filterAndSortNotifications = () => {
    let filtered = [...notifications]

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        notification =>
          notification.NotiTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (notification.NotiDesc && notification.NotiDesc.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Sort notifications
    filtered.sort((a, b) => {
      let aValue: any, bValue: any
      
      if (sortField === "ValidFrom" || sortField === "ValidTo" || sortField === "TransDate") {
        aValue = new Date(a[sortField]).getTime()
        bValue = new Date(b[sortField]).getTime()
      } else {
        aValue = a[sortField]
        bValue = b[sortField]
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc" 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue)
      }

      return sortDirection === "asc" 
        ? (aValue < bValue ? -1 : 1) 
        : (aValue > bValue ? -1 : 1)
    })

    setFilteredNotifications(filtered)
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const getNotificationStatus = (notification: Notification) => {
    const now = new Date()
    const validFrom = new Date(notification.ValidFrom)
    const validTo = new Date(notification.ValidTo)

    if (isBefore(now, validFrom)) {
      return {
        status: "upcoming",
        badge: (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
            Upcoming
          </Badge>
        )
      }
    } else if (isAfter(now, validTo)) {
      return {
        status: "expired",
        badge: (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
            Expired
          </Badge>
        )
      }
    } else {
      return {
        status: "active",
        badge: (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Active
          </Badge>
        )
      }
    }
  }

  const getNotificationType = (type: number) => {
    return type === 1 ? "General" : "Personal"
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronUp className="h-4 w-4 opacity-30" />
    return sortDirection === "asc" 
      ? <ChevronUp className="h-4 w-4" /> 
      : <ChevronDown className="h-4 w-4" />
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p>Loading notifications...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">My Notifications</h1>
          
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-60"
            />
          </div>
        </div>

        <Card>
          
          <CardContent>
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No notifications found</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? "No notifications match your search." : "You don't have any notifications yet."}
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead 
                        className="cursor-pointer"
                        onClick={() => handleSort("NotiTitle")}
                      >
                        <div className="flex items-center">
                          Title
                          <SortIcon field="NotiTitle" />
                        </div>
                      </TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead 
                        className="cursor-pointer"
                        onClick={() => handleSort("NotiType")}
                      >
                        <div className="flex items-center">
                          Type
                          <SortIcon field="NotiType" />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer"
                        onClick={() => handleSort("ValidFrom")}
                      >
                        <div className="flex items-center">
                          Valid From
                          <SortIcon field="ValidFrom" />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer"
                        onClick={() => handleSort("ValidTo")}
                      >
                        <div className="flex items-center">
                          Valid To
                          <SortIcon field="ValidTo" />
                        </div>
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredNotifications.map((notification) => {
                      const status = getNotificationStatus(notification)
                      
                      return (
                        <TableRow key={notification.NotiId}>
                          <TableCell className="font-medium">{notification.NotiTitle}</TableCell>
                          <TableCell>
                            {notification.NotiDesc ? (
                              <div className="max-w-xs truncate" title={notification.NotiDesc}>
                                {notification.NotiDesc}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">No description</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-gray-100">
                              {getNotificationType(notification.NotiType)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {format(parseISO(notification.ValidFrom), "MMM dd, yyyy")}
                          </TableCell>
                          <TableCell>
                            {format(parseISO(notification.ValidTo), "MMM dd, yyyy")}
                          </TableCell>
                          <TableCell>
                            {status.badge}
                          </TableCell>
                          <TableCell>
                            {notification.NotiFile && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(notification.NotiFile, "_blank")}
                                className="gap-2"
                              >
                                <Download className="h-4 w-4" />
                                Download
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}