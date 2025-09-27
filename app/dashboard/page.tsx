"use client"

import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {  FileText, TrendingUp, DollarSign } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Globe, Shield, Database, Users, BarChart3, Plus } from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"

type StatsResponse = {
  success: boolean
  data: {
    subscribers: number
    users: number
    jobs: number
    enquiries: number
  }
}
export function DashboardStats() {
    const { user } = useAuth()
   const [stats, setStats] = useState<StatsResponse["data"] | null>(null)
  const OrgCode = user?.OrgCode || 2000 // later you can take this from auth/session

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch(`https://api.smartcorpweb.com/api/stats/admin/${OrgCode}`)
        const json: StatsResponse = await res.json()
        if (json.success) setStats(json.data)
      } catch (error) {
        console.error("Error fetching stats:", error)
      }
    }
    fetchStats()
  }, [OrgCode])
    const cards = stats
    ? [
        {
          title: "Total Subscribers",
          value: stats.subscribers,
          icon: Users,
          color: "text-blue-600",
          link: "/admin-nl/subscribers"
        },
        {
          title: "Enquiries",
          value: stats.enquiries,
          icon: FileText,
          color: "text-green-600",
          link: "/admin-cms/enquiries"
        },
        {
          title: "Users",
          value: stats.users,
          icon: TrendingUp,
          color: "text-purple-600",
          link: "/user-management"
        },
        {
          title: "Applicants",
          value: stats.jobs,
          icon: DollarSign,
          color: "text-orange-600",
          link: "/admin-careers/job-applications"
        },
      ]
    : []

  return (
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.3 }}
        >
          <Link href={card.link}>
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                {card.title}
              </CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">
                {card.value}
              </div>
            </CardContent>
          </Card>
          </Link>
        </motion.div>
      ))}
    </div>
  )
}


const recentActivities = [
  {
    id: 1,
    title: "New website deployed",
    description: "E-commerce site went live successfully",
    time: "2 minutes ago",
    type: "website",
  },
  {
    id: 2,
    title: "Security scan completed",
    description: "All websites passed security audit",
    time: "1 hour ago",
    type: "security",
  },
  {
    id: 3,
    title: "Content updated",
    description: "Blog posts published across 3 sites",
    time: "3 hours ago",
    type: "content",
  },
  {
    id: 4,
    title: "User registered",
    description: "New client account created",
    time: "5 hours ago",
    type: "user",
  },
]

const upcomingTasks = [
  {
    id: 1,
    title: "SSL Certificate Renewal",
    description: "Renew certificates for 5 websites",
    dueDate: "Today, 2:00 PM",
    priority: "high",
    progress: 0,
  },
  {
    id: 2,
    title: "Performance Optimization",
    description: "Optimize loading speed for client sites",
    dueDate: "Tomorrow, 10:00 AM",
    priority: "medium",
    progress: 60,
  },
  {
    id: 3,
    title: "Client Presentation",
    description: "Present new website designs to stakeholders",
    dueDate: "Friday, 3:00 PM",
    priority: "high",
    progress: 30,
  },
]

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          {/* <p className="text-muted-foreground">Monitor and manage all your websites from one central location.</p> */}
        </motion.div>

        {/* Stats Cards */}
        <DashboardStats />

         {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Quick Actions</CardTitle>
              <CardDescription>Frequently used website management actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                  <Plus className="h-6 w-6" />
                  <span className="text-sm">New Website</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                  <Users className="h-6 w-6" />
                  <span className="text-sm">Manage Users</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                  <BarChart3 className="h-6 w-6" />
                  <span className="text-sm">View Analytics</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                  <Shield className="h-6 w-6" />
                  <span className="text-sm">Security Scan</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activities */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="lg:col-span-2"
          >
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Recent Activities</CardTitle>
                <CardDescription>Latest updates from your websites and systems</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex-shrink-0">
                      {activity.type === "website" && <Globe className="h-4 w-4 text-blue-600" />}
                      {activity.type === "security" && <Shield className="h-4 w-4 text-green-600" />}
                      {activity.type === "content" && <Database className="h-4 w-4 text-purple-600" />}
                      {activity.type === "user" && <Users className="h-4 w-4 text-orange-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Upcoming Tasks */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Upcoming Tasks</CardTitle>
                <CardDescription>Your schedule for today</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingTasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="space-y-3 p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-foreground">{task.title}</h4>
                        <p className="text-xs text-muted-foreground">{task.description}</p>
                      </div>
                      <Badge variant={task.priority === "high" ? "destructive" : "secondary"} className="text-xs">
                        {task.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <Globe className="h-3 w-3" />
                      <span>{task.dueDate}</span>
                    </div>
                    {task.progress > 0 && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="text-foreground">{task.progress}%</span>
                        </div>
                        <Progress value={task.progress} className="h-2" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

       
      </div>
    </DashboardLayout>
  )
}
