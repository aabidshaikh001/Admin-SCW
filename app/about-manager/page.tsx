import { AboutPageManager } from "@/components/about-page-manager"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function AboutManagerPage() {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <AboutPageManager />
      </div>
    </DashboardLayout>
  )
}
