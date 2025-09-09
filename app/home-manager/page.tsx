import { HomePageManager } from "@/components/home-page-manager"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function HomeManagerPage() {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <HomePageManager />
      </div>
    </DashboardLayout>
  )
}
