"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "react-toastify"
import { motion } from "framer-motion"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface OrgModule {
  OrgCode: number
  OrgName: string
  ModuleName: string
  Status: string
}

export default function ModulesMatrixPage() {
  const [orgModules, setOrgModules] = useState<OrgModule[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrgModules()
  }, [])

  const fetchOrgModules = async () => {
    try {
      const response = await fetch("https://api.smartcorpweb.com/api/assignmodules/org-modules")
      const data = await response.json()
      if (data.success) {
        setOrgModules(data.data)
      }
    } catch (error) {
      console.error("Error fetching org modules:", error)
      toast.error("Failed to fetch module assignments")
    } finally {
      setLoading(false)
    }
  }

  // Group by OrgCode
  const groupedData = orgModules.reduce((acc: any, item) => {
    if (!acc[item.OrgCode]) {
      acc[item.OrgCode] = {
        OrgCode: item.OrgCode,
        OrgName: item.OrgName,
        modules: {}
      }
    }
    acc[item.OrgCode].modules[item.ModuleName] = item.Status
    return acc
  }, {})

  const orgRows = Object.values(groupedData)

  const allModules = Array.from(new Set(orgModules.map(m => m.ModuleName)))

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h1 className="text-2xl font-bold">Modules Management</h1>
           <Link href="/org/modules/add">
              <Button>
                <Plus className="w-4 h-4 mr-2" /> Assign Module
              </Button>
            </Link>
          </motion.div>
        <Card>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Org Code</TableHead>
                  <TableHead>Org Name</TableHead>
                  {allModules.map(module => (
                    <TableHead key={module}>{module}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {orgRows.map((org: any) => (
                  <TableRow key={org.OrgCode}>
                    <TableCell>{org.OrgCode}</TableCell>
                    <TableCell>{org.OrgName}</TableCell>
                    {allModules.map(module => (
                      <TableCell key={module} className="text-center">
                        {org.modules[module] === "Active" ? (
                          <span className="text-green-600 font-bold">✓</span>
                        ) : (
                          <span className="text-red-600 font-bold">✗</span>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
