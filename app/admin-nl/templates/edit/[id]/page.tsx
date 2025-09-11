"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { DashboardLayout } from "@/components/dashboard-layout"
import Link from "next/link"
import dynamic from "next/dynamic"
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false })
import "react-quill/dist/quill.snow.css"
import { useAuth } from "@/contexts/auth-context"
interface OrgData {
  OrgID: number
  OrgCode: number
  OrgName: string
  Web?: string
  Logo?: string
  Favicon?: string
  Address1: string
  Address2?: string | null
  City: string
  State: string
  PinNo: number
  Email: string
  Phone?: string
  Mobile?: string
  SocialFB?: string
  SocialInsta?: string
  SocialTwitter?: string
  SocialLinkedIn?: string
  SocialYoutube?: string
}
const socialIcons: Record<string, string> = {
  fb: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/facebook.svg",
  insta: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/instagram.svg",
  twitter: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/twitter.svg",
  linkedin: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/linkedin.svg",
  youtube: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/youtube.svg",
}
interface Template {
  Id: number
  OrgCode: number
  Name: string
  Subject: string
  Body: string
  IsActive: boolean
  CreatedAt: string
  UpdatedAt: string
}

export default function EditTemplatePage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const [template, setTemplate] = useState<Template | null>(null)
const [orgData, setOrgData] = useState<OrgData | null>(null)
  const [formData, setFormData] = useState({
    Name: "",
    Subject: "",
    Body: "",
    IsActive: true,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchTemplate()
    if (user?.OrgCode) {
      fetchOrgData()
    }
  }, [params.id, user])

  const fetchTemplate = async () => {
    try {
      setLoading(true)
      const response = await fetch(`https://api.smartcorpweb.com/api/newsletter/template/${params.id}`)
      const data = await response.json()

      if (response.ok) {
        setTemplate(data)
        setFormData({
          Name: data.Name,
          Subject: data.Subject,
          Body: data.Body,
          IsActive: data.IsActive,
        })
      } else {
        throw new Error("Template not found")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch Emailer",
        variant: "destructive",
      })
      router.push("/admin-nl/templates")
    } finally {
      setLoading(false)
    }
  }

  // Fetch organization data
  const fetchOrgData = async () => {
    try {
      const orgCode = `${user?.OrgCode}`
      const response = await fetch(`https://api.smartcorpweb.com/api/orgs/profile/${orgCode}`)
      const data = await response.json()
      if (response.ok) {
        setOrgData(data)
      } else {
        console.error("Failed to fetch organization data")
      }
    } catch (error) {
      console.error("Error fetching organization data:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.Name || !formData.Subject || !formData.Body) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive",
      })
      return
    }

    try {
      setSaving(true)

      const response = await fetch(`https://api.smartcorpweb.com/api/newsletter/template/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Emailer updated successfully",
        })
        router.push("/admin-nl/templates")
      } else {
        throw new Error(data.error || "Failed to update Emailer")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update Emailer",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  // Function to generate the complete email HTML with header and footer
  const generateCompleteEmail = () => {
    if (!orgData) return formData.Body || "<p>No content to preview</p>"
    
    const currentDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
    
    const logoUrl = orgData.Logo 
      ? `https://api.smartcorpweb.com${orgData.Logo}` 
      : "https://kmaassociates.in/images/logo.png"
    
    return `
      <!doctype html>
      <html>
        <body style="Margin:0;padding:0;background-color:#f4f4f4;font-family:Arial, sans-serif;color:#333333;">
          <!-- Outer wrapper -->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#f4f4f4;padding:20px 0;">
            <tr>
              <td align="center">
                <!-- Main container -->
                <table role="presentation" class="container" cellspacing="0" cellpadding="0" border="0" width="600" style="width:600px;max-width:600px;background-color:#ffffff;border-radius:8px;overflow:hidden;">
                  <!-- Preheader -->
                  <tr>
                    <td style="display:none!important;visibility:hidden;mso-hide:all;font-size:1px;color:#ffffff;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
                      ${formData.Subject}
                    </td>
                  </tr>

                  <!-- Header row -->
                  <tr>
                    <td style="padding:18px 20px;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <!-- Left: Logo -->
                          <td class="logo" valign="middle" style="width:160px;">
                            <a href="${orgData.Web || '#'}" style="text-decoration:none;display:inline-block;">
                              <img src="${logoUrl}" alt="${orgData.OrgName} Logo" style="display:block;border:0;outline:none;text-decoration:none;height:50px;">
                            </a>
                          </td>

                          <!-- Center: Title + Tagline -->
                          <td class="title-block" valign="middle" align="right" style="padding:4px 16px;">
                            <div style="font-size:22px;font-weight:700;line-height:1.1;color:#111111;" class="title">
                              Newsletter
                            </div>
                            <div style="font-size:13px;color:#666666;margin-top:6px;" class="tagline">
                              ${currentDate}
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                
                  <!-- Email Content -->
                  <tr>
                 
                    <td style="padding:20px;">
                       <hr style="border:none;border-top:1px solid #eeeeee;margin:0 0 20px 0;"> </br>
                      ${formData.Body || "<p>No content to preview</p>"}
                    </td>
                  </tr>
                </table>
                
                <!-- Footer -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#f4f4f4;padding:20px 0;">
                  <tr>
                    <td style="padding:0 20px 20px;">
                      <hr style="border:none;border-top:1px solid #eeeeee;margin:0 0 20px 0;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td align="center" style="font-size:12px;line-height:18px;color:#888888;">
                            
                          <!-- Social icons -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:12px;">
                              <tr>
                          ${orgData.SocialFB ? `
  <td style="padding:0 6px;">
    <a href="${orgData.SocialFB}" style="display:inline-block;" target="_blank">
      <img src="${socialIcons.fb}" alt="Facebook" width="24" style="display:block;border:0;outline:none;text-decoration:none;height:auto;">
    </a>
  </td>
` : ''}
${orgData.SocialInsta ? `
  <td style="padding:0 6px;">
    <a href="${orgData.SocialInsta}" style="display:inline-block;" target="_blank">
      <img src="${socialIcons.insta}" alt="Instagram" width="24" style="display:block;border:0;outline:none;text-decoration:none;height:auto;">
    </a>
  </td>
` : ''}
${orgData.SocialTwitter ? `
  <td style="padding:0 6px;">
    <a href="${orgData.SocialTwitter}" style="display:inline-block;" target="_blank">
      <img src="${socialIcons.twitter}" alt="Twitter" width="24" style="display:block;border:0;outline:none;text-decoration:none;height:auto;">
    </a>
  </td>
` : ''}
${orgData.SocialLinkedIn ? `
  <td style="padding:0 6px;">
    <a href="${orgData.SocialLinkedIn}" style="display:inline-block;" target="_blank">
      <img src="${socialIcons.linkedin}" alt="LinkedIn" width="24" style="display:block;border:0;outline:none;text-decoration:none;height:auto;">
    </a>
  </td>
` : ''}
${orgData.SocialYoutube ? `
  <td style="padding:0 6px;">
    <a href="${orgData.SocialYoutube}" style="display:inline-block;" target="_blank">
      <img src="${socialIcons.youtube}" alt="YouTube" width="24" style="display:block;border:0;outline:none;text-decoration:none;height:auto;">
    </a>
  </td>
` : ''}
     </tr>
                            </table>

                            <!-- Company Info -->
                            <div style="margin-bottom:10px;">
                              <strong>${orgData.OrgName}</strong><br>
                              ${orgData.Address1}${orgData.Address2 ? `, ${orgData.Address2}` : ''}<br>
                              ${orgData.City}, ${orgData.State} ${orgData.PinNo}<br>
                              <a href="mailto:${orgData.Email}" style="color:#888888;text-decoration:none;">${orgData.Email}</a> | 
                              <a href="tel:${orgData.Mobile || orgData.Phone}" style="color:#888888;text-decoration:none;">${orgData.Mobile || orgData.Phone}</a>
                            </div>

                            <!-- Unsubscribe -->
                            <div style="margin-top:10px;font-size:11px;color:#aaaaaa;">
                              You are receiving this email because you subscribed to our newsletter.<br>
                              <a href="{{UNSUBSCRIBE_LINK}}" style="color:#aaaaaa;text-decoration:underline;">Unsubscribe</a> | 
                            
                            </div>

                            <!-- Copyright -->
                            <div style="margin-top:12px;font-size:11px;color:#aaaaaa;">
                              &copy; ${new Date().getFullYear()} ${orgData.OrgName}. All rights reserved.
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/3"></div>
          </div>
          <Card>
            <CardHeader>
              <div className="h-6 bg-muted rounded w-1/3"></div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                  <div className="h-10 bg-muted rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                  <div className="h-10 bg-muted rounded"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="h-40 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Emailer (Update)</h1>
          </div>
        </motion.div>

        {/* Form */}
        <Card>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Emailer Name *</Label>
                  <Input
                    id="name"
                    value={formData.Name}
                    onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
                    placeholder="Emailer Name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Email Subject *</Label>
                  <Input
                    id="subject"
                    value={formData.Subject}
                    onChange={(e) => setFormData({ ...formData, Subject: e.target.value })}
                    placeholder="Email Subject"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="body">Email Body *</Label>
                <Tabs defaultValue="edit" className="w-full">
                  <TabsList>
                    <TabsTrigger value="edit">Edit</TabsTrigger>
                    <TabsTrigger value="full-preview">Preview</TabsTrigger>
                    {/* <TabsTrigger value="full-preview">Full Email Preview</TabsTrigger> */}
                  </TabsList>

                  {/* HTML Editor */}
                  <TabsContent value="edit">
                    <ReactQuill
                      theme="snow"
                      value={formData.Body}
                      onChange={(value) => setFormData({ ...formData, Body: value })}
                      className="bg-white rounded-md"
                      style={{ minHeight: "300px" }}
                    />
                  </TabsContent>

                  {/* Content Preview */}
                  <TabsContent value="preview">
                    <div
                      className="border rounded-md p-4 min-h-[300px] bg-white"
                      dangerouslySetInnerHTML={{ __html: formData.Body || "<p>No content to preview</p>" }}
                    />
                  </TabsContent>

                  {/* Full Email Preview */}
                  <TabsContent value="full-preview">
                    <div className="border rounded-md p-4 min-h-[300px] bg-white">
                      {orgData ? (
                        <iframe
                          srcDoc={generateCompleteEmail()}
                          style={{ 
                            width: '100%', 
                            height: '600px', 
                            border: 'none',
                            backgroundColor: '#f4f4f4'
                          }}
                          title="Email Preview"
                        />
                      ) : (
                        <p>Loading organization data for preview...</p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.IsActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, IsActive: checked })}
                />
                <Label htmlFor="isActive">Active Emailer</Label>
              </div>

              {template && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Created</Label>
                    <p className="text-sm">{new Date(template.CreatedAt).toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Last Updated</Label>
                    <p className="text-sm">{new Date(template.UpdatedAt).toLocaleString()}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Link href="/admin-nl/templates">
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Save className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}