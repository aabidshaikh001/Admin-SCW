"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AuthorManager } from "@/components/author-manager"
import { CategoryManager } from "@/components/category-manager"
import { TeamMemberManager } from "@/components/team-member-manager"
import { Users, Tag, SettingsIcon, UserCheck } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("authors")

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <SettingsIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Settings</h1>
              <p className="text-muted-foreground">Manage your blog authors, categories, and team members</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Content & Team Management</CardTitle>
              <CardDescription>Configure authors, categories, and team members for your website</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="authors" className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Authors
                  </TabsTrigger>
                  <TabsTrigger value="categories" className="flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Categories
                  </TabsTrigger>
                  <TabsTrigger value="team-members" className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4" />
                    Team Members
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="authors" className="mt-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <AuthorManager />
                  </motion.div>
                </TabsContent>

                <TabsContent value="categories" className="mt-6">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CategoryManager />
                  </motion.div>
                </TabsContent>

                <TabsContent value="team-members" className="mt-6">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <TeamMemberManager />
                  </motion.div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
