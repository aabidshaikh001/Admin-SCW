import type { Metadata } from "next"
import { DashboardLayout } from "@/components/dashboard-layout"
import NotificationList from "./components/notification-list"

export const metadata: Metadata = {
  title: "Manage Notifications | Dashboard",
  description: "Create and manage system notifications for all organizations",
}

export default function NotificationManagerPage() {
  return (
    <DashboardLayout>
      <NotificationList />
    </DashboardLayout>
  )
}
