"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import NotificationForm from "@/components/notification-form"
import { notificationApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface EditNotificationPageProps {
  params: {
    id: string
  }
}

export default function EditNotificationPage({ params }: EditNotificationPageProps) {
  const [notification, setNotification] = useState(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchNotification()
  }, [params.id])

  const fetchNotification = async () => {
    try {
      const data = await notificationApi.getById(params.id)
      setNotification(data)
    } catch (error) {
      console.error("Error fetching notification:", error)
      toast({
        title: "Error",
        description: "Failed to fetch notification details",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

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
