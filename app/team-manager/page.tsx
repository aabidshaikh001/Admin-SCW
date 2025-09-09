import type { Metadata } from "next"
import TeamPageManager from "@/components/team-page-manager"
import { DashboardLayout } from "@/components/dashboard-layout"

export const metadata: Metadata = {
  title: "Team Manager | WMS Dashboard",
  description: "Manage your team page sections and content",
}

export default function TeamManagerPage() {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <TeamPageManager />
      </div>
    </DashboardLayout>
  )
}
