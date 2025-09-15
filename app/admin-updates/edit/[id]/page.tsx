"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import NotificationForm from "../../add"
import { useAuth } from "@/contexts/auth-context"

import { useToast } from "@/hooks/use-toast"
interface Notification {
  NotiId: number
  OrgCode: number
  NotiType: number
  UserId: number
  NotiTitle: string
  ValidFrom: string
  ValidTo: string
  NotiFile: string
  NotiDesc: string
  IsDeleted: boolean
  TransDate: string
  TransBy: string
  TranDateUpdate: string | null
  TranByUpdate: string | null
  TranDateDel: string | null
  TranByDel: string | null
}

interface EditNotificationPageProps {
  params: {
    id: string
  }
}

export default function EditNotificationPage({ params }: EditNotificationPageProps) {
   const { user } = useAuth()
const [notification, setNotification] = useState<Notification | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
 const fetchNotification = async () => {
  try {
    setLoading(true)
    const res = await fetch(`https://api.smartcorpweb.com/api/admin-updates/${user?.OrgCode}`)
    if (!res.ok) {
      throw new Error("Failed to fetch notifications")
    }
    const data: Notification[] = await res.json()

    // Find by params.id (convert to number for safety)
    const found = data.find((n) => n.NotiId === Number(params.id)) || null
    setNotification(found)
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
    fetchNotification()
  }, [params.id])

  
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!notification) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-foreground mb-2">Notification Not Found</h2>
          <p className="text-muted-foreground">The notification you're looking for doesn't exist.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <NotificationForm initialData={notification} isEdit={true} notificationId={params.id} />
    </DashboardLayout>
  )
}
