import type { Metadata } from "next"
import { DashboardLayout } from "@/components/dashboard-layout"
import NotificationForm from "../add"

export const metadata: Metadata = {
  title: "Add Notification | Dashboard",
  description: "Create a new system notification",
}

export default function AddNotificationPage() {
  return (
    <DashboardLayout>
      <NotificationForm />
    </DashboardLayout>
  )
}
