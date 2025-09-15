import { DashboardLayout } from "@/components/dashboard-layout"
import { TeamMemberManager } from "@/components/team-member-manager"

export default function Team(){
    return(
           <DashboardLayout>
            <TeamMemberManager/>
           </DashboardLayout>
    )
}