"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Search, Filter, Mail, CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useAuth } from "@/contexts/auth-context"
interface EmailSent {
  Id: number
  OrgCode: number
  SubscriberId: number
  TemplateId: number
  SentAt: string
  Status: "Sent" | "Failed"
  ErrorMessage?: string
  TemplateName?: string
  Subject?: string
  SubscriberEmail?: string
}

interface GroupedEmail {
  TemplateName: string
  Subject: string
  Date: string
  total: number
  sent: number
  failed: number
}
interface EmailSent {
  Id: number
  OrgCode: number
  SubscriberId: number
  TemplateId: number
  SentAt: string
  Status: "Sent" | "Failed"
  ErrorMessage?: string
  TemplateName?: string
  Subject?: string
  SubscriberEmail?: string
}

export default function EmailSentPage() {
        const { user, isLoading } = useAuth()
  const [emailsSent, setEmailsSent] = useState<EmailSent[]>([])
    const [groupedEmails, setGroupedEmails] = useState<GroupedEmail[]>([])
  const [filteredEmails, setFilteredEmails] = useState<EmailSent[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchEmailsSent()
  }, [])

  useEffect(() => {
    filterEmails()
  }, [searchTerm, statusFilter, emailsSent])


  useEffect(() => {
    groupEmails()
  }, [emailsSent, searchTerm, statusFilter])

  const fetchEmailsSent = async () => {
    try {
      setLoading(true)
      const orgCode = `${user?.OrgCode}` 
      const response = await fetch(`http://localhost:5000/api/newsletter/sent/${orgCode}`)
      const data = await response.json()
      setEmailsSent(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch email history",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterEmails = () => {
    let filtered = emailsSent

    if (searchTerm) {
      filtered = filtered.filter(
        (email) =>
          email.TemplateName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          email.Subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          email.SubscriberEmail?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "All") {
      filtered = filtered.filter((email) => email.Status === statusFilter)
    }

    setFilteredEmails(filtered)
  }

  const getStatusBadge = (status: string, errorMessage?: string) => {
    switch (status) {
      case "Sent":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
            <CheckCircle className="w-3 h-3 mr-1" />
            Sent
          </Badge>
        )
      case "Failed":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-800 border-red-300 cursor-help"
            title={errorMessage || "Failed to send"}
          >
            <XCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">
            <Clock className="w-3 h-3 mr-1" />
            {status}
          </Badge>
        )
    }
  }
  const groupEmails = () => {
    let filtered = emailsSent

    if (searchTerm) {
      filtered = filtered.filter(
        (email) =>
          email.TemplateName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          email.Subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          email.SubscriberEmail?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "All") {
      filtered = filtered.filter((email) => email.Status === statusFilter)
    }

    const grouped: Record<string, GroupedEmail> = {}

    filtered.forEach((email) => {
      const date = new Date(email.SentAt).toLocaleDateString()
      const key = `${email.TemplateName}-${email.Subject}-${date}`

      if (!grouped[key]) {
        grouped[key] = {
          TemplateName: email.TemplateName || `Template #${email.TemplateId}`,
          Subject: email.Subject || "No Subject",
          Date: date,
          total: 0,
          sent: 0,
          failed: 0,
        }
      }

      grouped[key].total += 1
      if (email.Status === "Sent") grouped[key].sent += 1
      if (email.Status === "Failed") grouped[key].failed += 1
    })

    setGroupedEmails(Object.values(grouped))
  }
  const getStats = () => {
    const total = emailsSent.length
    const sent = emailsSent.filter((e) => e.Status === "Sent").length
    const failed = emailsSent.filter((e) => e.Status === "Failed").length
    const successRate = total > 0 ? ((sent / total) * 100).toFixed(1) : "0"

    return { total, sent, failed, successRate }
  }

  const stats = getStats()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
      {/* Page Header with Search, Filter, Refresh */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
>
  {/* Title */}
  <h1 className="text-2xl font-bold flex items-center gap-2">
    <Mail className="w-6 h-6" />
    Email History
  </h1>

  {/* Search + Filter + Refresh in one row */}
  <div className="flex flex-1 sm:flex-none items-center gap-2">
    {/* Search */}
    <div className="relative w-full sm:w-64">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
      <Input
        placeholder="Search emails..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-10"
      />
    </div>

    {/* Filter */}
    <Select value={statusFilter} onValueChange={setStatusFilter}>
      <SelectTrigger className="w-[150px]">
        <Filter className="w-4 h-4 mr-2" />
        <SelectValue placeholder="Status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="All">All</SelectItem>
        <SelectItem value="Sent">Sent</SelectItem>
        <SelectItem value="Failed">Failed</SelectItem>
      </SelectContent>
    </Select>

    {/* Refresh */}
    <Button onClick={fetchEmailsSent} disabled={loading} variant="outline" className="bg-blue-600 text-white hover:bg-blue-700 ">
        Refresh
      <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
    </Button>
  </div>
</motion.div>


        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Sent</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Mail className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Successful</p>
                  <p className="text-2xl font-bold text-green-600">{stats.sent}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Failed</p>
                  <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold">{stats.successRate}%</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

       <Card>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse flex space-x-4 p-4 border rounded-lg">
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : groupedEmails.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground">No emails found</h3>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Emailer</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Total Mails</TableHead>
                    <TableHead>Sent</TableHead>
                    <TableHead>Failed</TableHead>
                    <TableHead>Sent Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupedEmails.map((group, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{group.TemplateName}</TableCell>
                      <TableCell>{group.Subject}</TableCell>
                      <TableCell className="font-bold">{group.total}</TableCell>
                      <TableCell className="text-green-600">{group.sent}</TableCell>
                      <TableCell className="text-red-600">{group.failed}</TableCell>
                      <TableCell>{group.Date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  )
}