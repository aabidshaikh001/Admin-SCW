"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { notificationApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

interface Organization {
  OrgID: number
  OrgCode: number
  OrgName: string
}

interface NotificationFormProps {
  initialData?: any
  isEdit?: boolean
  notificationId?: string
}

export default function NotificationForm({ initialData, isEdit = false, notificationId }: NotificationFormProps) {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    NotiType: initialData?.NotiType || 1,
    OrgCode: initialData?.OrgCode || 0,
    NotiTitle: initialData?.NotiTitle || "",
    ValidFrom: initialData?.ValidFrom ? new Date(initialData.ValidFrom) : null as Date | null,
    ValidTo: initialData?.ValidTo ? new Date(initialData.ValidTo) : null as Date | null,
    NotiFile: initialData?.NotiFile || "",
    NotiDesc: initialData?.NotiDesc || "",
  })
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchOrganizations()
  }, [])

  const fetchOrganizations = async () => {
    try {
      const data = await notificationApi.getOrgList()
      setOrganizations(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching organizations:", error)
    }
  }

const handleSubmit = async () => {
  // Validate dates
  if (!formData.ValidFrom || !formData.ValidTo) {
    toast({
      title: "Error",
      description: "Please select both Valid From and Valid To dates",
      variant: "destructive",
    })
    return
  }

  // Ensure ValidTo > ValidFrom
  if (formData.ValidTo <= formData.ValidFrom) {
    toast({
      title: "Error",
      description: "Valid To date must be greater than Valid From date",
      variant: "destructive",
    })
    return
  }

  try {
    setLoading(true)
    if (isEdit && notificationId) {
      await notificationApi.update(notificationId, formData)
      toast({
        title: "Success",
        description: "Notification updated successfully",
      })
    } else {
      await notificationApi.create(formData)
      toast({
        title: "Success",
        description: "Notification created successfully",
      })
    }
    router.push("/sa-notifications")
  } catch (error) {
    console.error("Error saving notification:", error)
    toast({
      title: "Error",
      description: `Failed to ${isEdit ? "update" : "create"} notification`,
      variant: "destructive",
    })
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {isEdit ? "Edit Notification" : "Create New Notification"}
        </h1>
        <p className="text-muted-foreground">
          {isEdit ? "Update the notification details" : "Create a new notification to send to organizations"}
        </p>
      </div>

      <div className="space-y-6 p-4 border rounded-lg">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Notification Title</Label>
            <Input
              id="title"
              value={formData.NotiTitle}
              onChange={(e) => setFormData({ ...formData, NotiTitle: e.target.value })}
              placeholder="Enter notification title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Notification Type</Label>
            <Select
              value={formData.NotiType.toString()}
              onValueChange={(value) => setFormData({ ...formData, NotiType: Number.parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select notification type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">All Organizations</SelectItem>
                <SelectItem value="2">Individual Organization</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.NotiType === 2 && (
            <div className="space-y-2">
              <Label htmlFor="org">Organization</Label>
              <Select
                value={formData.OrgCode.toString()}
                onValueChange={(value) => setFormData({ ...formData, OrgCode: Number.parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select organization" />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.OrgCode} value={org.OrgCode.toString()}>
                      {org.OrgName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Valid From</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.ValidFrom && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.ValidFrom ? format(formData.ValidFrom, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                 <DatePicker
  selected={formData.ValidFrom}
  onChange={(date: Date | null) => setFormData({ ...formData, ValidFrom: date })}
  inline
/>

                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Valid To</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.ValidTo && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.ValidTo ? format(formData.ValidTo, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
               <DatePicker
  selected={formData.ValidTo}
  onChange={(date: Date | null) => setFormData({ ...formData, ValidTo: date })}
  inline
/>

                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Attachment File (Optional)</Label>
            <Input
              id="file"
              value={formData.NotiFile}
              onChange={(e) => setFormData({ ...formData, NotiFile: e.target.value })}
              placeholder="Enter file path or URL"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.NotiDesc}
              onChange={(e) => setFormData({ ...formData, NotiDesc: e.target.value })}
              placeholder="Enter notification description"
              rows={4}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={() => router.push("/sa-notifications")} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "Saving..." : isEdit ? "Update" : "Create"} Notification
        </Button>
      </div>
    </div>
  )
}