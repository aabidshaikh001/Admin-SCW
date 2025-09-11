"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Mail, FileText, Calendar, User, Clock, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { DashboardLayout } from "@/components/dashboard-layout"
import Link from "next/link"

interface SMTranQuery {
  QID: number
  OrgCode: string
  Email: string
  QueryDesc: string
  QueryFile: string
  SysAdmDesc: string
  Status: "Open" | "In Progress" | "Closed"
  TranCreate: string
  TranByCreate: string
  TranUpdate: string
  TranByUpdate: string
}

export default function EditTicketPage() {
  const [query, setQuery] = useState<SMTranQuery | null>(null)
  const [status, setStatus] = useState<"Open" | "In Progress" | "Closed">("Open")
  const [sysAdmDesc, setSysAdmDesc] = useState("")
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const params = useParams()
  const ticketId = params.id as string

  useEffect(() => {
    if (ticketId) {
      fetchQuery()
    }
  }, [ticketId])

  const fetchQuery = async () => {
    try {
      setLoading(true)
      // Replace with your API call
      const response = await fetch(`https://api.smartcorpweb.com/api/queries/${ticketId}`)
      const data = await response.json()
      if (data.success) {
        setQuery(data.data)
        setStatus(data.data.Status)
        setSysAdmDesc(data.data.SysAdmDesc || "")
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch ticket details",
          variant: "destructive",
        })
        router.push("/sa-tickets")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch ticket details",
        variant: "destructive",
      })
      router.push("/sa-tickets")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!query) return

    try {
      setUpdating(true)
      const response = await fetch(`https://api.smartcorpweb.com/api/queries/${query.QID}/admin`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Status: status,
          SysAdmDesc: sysAdmDesc,
          TranByUpdate: "Super Admin", // Replace with actual admin name from auth
        }),
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Success",
          description: "Ticket updated successfully",
        })
        router.push("/sa-tickets")
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update ticket",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Open":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            Open
          </Badge>
        )
      case "In Progress":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
            In Progress
          </Badge>
        )
      case "Closed":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
            Closed
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
          <Card>
            <CardHeader>
              <div className="animate-pulse space-y-2">
                <div className="h-6 bg-muted rounded w-1/3"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="animate-pulse space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-4 bg-muted rounded"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  if (!query) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground">Ticket not found</h3>
          <p className="text-sm text-muted-foreground mb-4">The requested ticket could not be found.</p>
          <Button asChild>
            <Link href="/sa-tickets">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Tickets
            </Link>
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div>
           
            <h1 className="text-2xl font-bold text-foreground">Edit Ticket #{query.QID}</h1>
           
          </div>
        </motion.div>

        {/* Ticket Details */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  Ticket #{query.QID}
                  {getStatusBadge(query.Status)}
                </CardTitle>
                <CardDescription>Ticket details and admin response</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-muted-foreground">Organization Code</Label>
                <p className="font-medium">{query.OrgCode}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Email</Label>
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                  <p className="font-medium">{query.Email}</p>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Created By</Label>
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2 text-muted-foreground" />
                  <p className="font-medium">{query.TranByCreate}</p>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Created On</Label>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                  <p className="font-medium">{new Date(query.TranCreate).toLocaleString()}</p>
                </div>
              </div>
              {query.TranUpdate && (
                <>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Last Updated By</Label>
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2 text-muted-foreground" />
                      <p className="font-medium">{query.TranByUpdate}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Last Updated On</Label>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                      <p className="font-medium">{new Date(query.TranUpdate).toLocaleString()}</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Query Description */}
            <div className="space-y-2">
              <Label className="text-muted-foreground">Query Description</Label>
              <div className="p-4 border rounded-md bg-muted/20">
                <p className="whitespace-pre-wrap">{query.QueryDesc}</p>
              </div>
            </div>

            {/* Attached File */}
            {query.QueryFile && (
              <div className="space-y-2">
                <Label className="text-muted-foreground">Attached File</Label>
                <div className="flex items-center p-3 border rounded-md">
                  <FileText className="w-5 h-5 mr-3 text-muted-foreground" />
                  <a
                    href={`https://api.smartcorpweb.com${query.QueryFile}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    View File
                  </a>
                </div>
              </div>
            )}

            {/* Admin Response Section */}
            <div className="space-y-4 border-t pt-6">
              <h3 className="font-semibold text-lg">Admin Response</h3>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(value: "Open" | "In Progress" | "Closed") => setStatus(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Open">Open</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sysAdmDesc">Admin Notes</Label>
                <Textarea
                  id="sysAdmDesc"
                  value={sysAdmDesc}
                  onChange={(e) => setSysAdmDesc(e.target.value)}
                  placeholder="Enter response or notes for this ticket..."
                  rows={6}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" asChild disabled={updating}>
                  <Link href="/sa-tickets">
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Link>
                </Button>
                <Button onClick={handleSave} disabled={updating}>
                  {updating ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
