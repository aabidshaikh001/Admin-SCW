import { BlogManager } from "@/components/blog-manager"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function BlogManagerPage() {
  return (
    <DashboardLayout>
    <div className="container mx-auto py-6">
      <BlogManager />
    </div>
    </DashboardLayout>
  )
}
