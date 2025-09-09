import { CareersPageManager } from "@/components/careers-page-manager"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function CareersManagerPage() {
  return (
       <DashboardLayout>
    <div className="container mx-auto py-6">
      <CareersPageManager />
    </div>
    </DashboardLayout>
  )
}
