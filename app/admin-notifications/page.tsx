import type { Metadata } from "next"
import NotificationsPage from "@/components/notifications-page"
import {DashboardLayout} from "@/components/dashboard-layout"

export const metadata: Metadata = {
  title: "Notifications | Dashboard",
  description: "View your organization's notifications and announcements",
}

export default function NotificationsPageRoute() {
  return (
    <DashboardLayout>
      <NotificationsPage />
    </DashboardLayout>
  )
}
