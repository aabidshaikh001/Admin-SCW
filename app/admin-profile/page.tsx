"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/auth-context"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { DashboardLayout } from "@/components/dashboard-layout"
import { 
  Building, 
  Mail, 
  Phone, 
  Calendar, 
  FileText, 
  Camera, 
  Save, 
  Edit3, 
  Shield, 
  Clock,
  Globe,
  MapPin,
  Users,
  CreditCard,
  Link,
  Eye
} from "lucide-react"

const orgProfileSchema = z.object({
  OrgName: z.string().min(2, "Organization name must be at least 2 characters"),
  OrgType: z.string().min(1, "Please select organization type"),
  ContactPerson: z.string().min(2, "Contact person name is required"),
  EstYear: z.string().min(4, "Please enter valid establishment year"),
  Email: z.string().email("Please enter a valid email address"),
  Phone: z.string().min(10, "Please enter a valid Phone number"),
  Mobile: z.string().min(10, "Please enter a valid Mobile number"),
  Web: z.string().url("Please enter a valid Web URL").optional().or(z.literal("")),
  Address1: z.string().min(10, "Address must be at least 10 characters"),
  Address2: z.string().optional(),
  City: z.string().min(1, "City is required"),
  State: z.string().min(1, "State is required"),
  Country: z.string().min(1, "Country is required"),
  PinNo: z.string().min(3, "PIN code is required"),
  SchoolMoto: z.string().min(10, "Motto should be at least 10 characters"),
  PANNo: z.string().min(10, "PAN number must be 10 characters").max(10),
  GSTINNo: z.string().min(15, "GSTIN must be 15 characters").max(15),
})

type OrgProfileFormData = z.infer<typeof orgProfileSchema>

interface OrganizationProfile {
  OrgID: number
  OrgCode: number
  OrgType: string
  OrgName: string
  ContactPerson: string
  EstYear: number
  MultiBranch: string
  AffiliatedTo: string
  AffiliationNo: string
  SchoolMoto: string
  RegistrationNo: string
  BoardUniversity: string
  Web: string
  Logo: string
  Favicon: string
  Address1: string
  Address2: string
  Country: string
  State: string
  City: string
  PinNo: number
  Phone: string
  Mobile: string
  Email: string
  PANNo: string
  GSTINNo: string
  ACHolderName: string
  BankAccount: string
  BankCode: string
  BankBranch: string
  BankIFSC: string
  SubsType: string
  SubsFrom: string
  SubsTo: string
  SocialFB: string
  SocialInsta: string
  SocialTwitter: string
  SocialLinkedIn: string
  SocialYoutube: string
  SocialPinterest: string
  AdminEmail: string
  WAMsgVisit: string
  WAMsgBusiness: string
  Status: string
  IsDeleted: boolean
  TransDate: string
  TransBy: string | null
  TranDateUpdate: string
  TranByUpdate: string | null
  TranDateDel: string | null
  TranByDel: string | null
}

export default function OrganizationProfilePage() {
    const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [orgData, setOrgData] = useState<OrganizationProfile | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string>("")
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<OrgProfileFormData>({
    resolver: zodResolver(orgProfileSchema),
  })

  useEffect(() => {
    fetchOrganizationProfile()
  }, [])

  const fetchOrganizationProfile = async () => {
    try {
      // Replace 2000 with dynamic OrgCode from auth context if needed
      const response = await fetch(`https://api.smartcorpweb.com/api/orgs/profile/${user?.OrgCode}`)
      if (response.ok) {
        const data = await response.json()
        setOrgData(data)
        setLogoPreview(`https://api.smartcorpweb.com${data.Logo}`)
        
        // Reset form with fetched data
        reset({
          OrgName: data.OrgName,
          OrgType: data.OrgType,
          ContactPerson: data.ContactPerson,
          EstYear: data.EstYear.toString(),
          Email: data.Email,
          Phone: data.Phone,
          Mobile: data.Mobile,
          Web: data.Web,
          Address1: data.Address1,
          Address2: data.Address2,
          City: data.City,
          State: data.State,
          Country: data.Country,
          PinNo: data.PinNo.toString(),
          SchoolMoto: data.SchoolMoto,
          PANNo: data.PANNo,
          GSTINNo: data.GSTINNo,
        })
      } else {
        throw new Error("Failed to fetch organization profile")
      }
    } catch (error) {
      console.error("Error fetching organization profile:", error)
      toast({
        title: "Error",
        description: "Failed to load organization profile",
        variant: "destructive",
      })
    }
  }

  const onSubmit = async (data: OrgProfileFormData) => {
    setIsLoading(true)
    try {
      const formData = new FormData()
      
      // Append all form data
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value as string)
      })
      
      if (logoFile) {
        formData.append("logo", logoFile)
      }

      // Simulate API update - replace with your actual endpoint
      const response = await fetch(`https://api.smartcorpweb.com/api/orgs/profile/${orgData?.OrgID}`, {
        method: "PUT",
        body: formData,
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Organization profile updated successfully!",
        })
        setIsEditing(false)
        fetchOrganizationProfile() // Refresh data
      } else {
        throw new Error("Failed to update profile")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      setLogoPreview(URL.createObjectURL(file))
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (!orgData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Organization Header */}
        <motion.div initial={{ opaCity: 0, y: 20 }} animate={{ opaCity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24 rounded-lg">
                    <AvatarImage src={logoPreview} alt={orgData.OrgName} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xl rounded-lg">
                      {getInitials(orgData.OrgName)}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button size="sm" variant="secondary" className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0">
                      <Label htmlFor="logo" className="cursor-pointer">
                        <Camera className="h-4 w-4" />
                      </Label>
                      <Input id="logo" type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
                    </Button>
                  )}
                </div>

                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-2xl font-bold text-foreground">{orgData.OrgName}</h1>
                  <p className="text-muted-foreground">{orgData.OrgType} • Est. {orgData.EstYear}</p>
                  <p className="text-sm text-muted-foreground mt-1">{orgData.SchoolMoto}</p>
                  <div className="flex flex-wrap gap-2 mt-2 justify-center md:justify-start">
                    <Badge variant="secondary">Code: {orgData.OrgCode}</Badge>
                    <Badge variant={orgData.Status === "Active" ? "default" : "destructive"}>{orgData.Status}</Badge>
                    <Badge variant="outline">{orgData.SubsType} Subscription</Badge>
                  </div>
                </div>

                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  variant={isEditing ? "outline" : "default"}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  {isEditing ? "Cancel" : "Edit Profile"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Organization Information */}
          <motion.div
            initial={{ opaCity: 0, x: -20 }}
            animate={{ opaCity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="lg:col-span-2 space-y-6"
          >
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Organization Details
                </CardTitle>
                <CardDescription>Manage your organization's basic information</CardDescription>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="OrgName">Organization Name *</Label>
                        <Input
                          id="OrgName"
                          {...register("OrgName")}
                          placeholder="Enter organization name"
                        />
                        {errors.OrgName && <p className="text-sm text-destructive">{errors.OrgName.message}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="OrgType">Organization Type *</Label>
                        <Select onValueChange={(value) => setValue("OrgType", value)} defaultValue={orgData.OrgType}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Corporate">Corporate</SelectItem>
                            <SelectItem value="Educational">Educational</SelectItem>
                            <SelectItem value="Government">Government</SelectItem>
                            <SelectItem value="Non-Profit">Non-Profit</SelectItem>
                            <SelectItem value="Startup">Startup</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.OrgType && <p className="text-sm text-destructive">{errors.OrgType.message}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="ContactPerson">Contact Person *</Label>
                        <Input
                          id="ContactPerson"
                          {...register("ContactPerson")}
                          placeholder="Contact person name"
                        />
                        {errors.ContactPerson && <p className="text-sm text-destructive">{errors.ContactPerson.message}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="EstYear">Established Year *</Label>
                        <Input
                          id="EstYear"
                          type="number"
                          {...register("EstYear")}
                          placeholder="YYYY"
                        />
                        {errors.EstYear && <p className="text-sm text-destructive">{errors.EstYear.message}</p>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="SchoolMoto">Organization Motto *</Label>
                      <Textarea
                        id="SchoolMoto"
                        {...register("SchoolMoto")}
                        placeholder="Brief description of your organization"
                        rows={3}
                      />
                      {errors.SchoolMoto && <p className="text-sm text-destructive">{errors.SchoolMoto.message}</p>}
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save Changes
                    </Button>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground">Organization Name</Label>
                        <p className="text-foreground font-medium">{orgData.OrgName}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Organization Type</Label>
                        <p className="text-foreground font-medium">{orgData.OrgType}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Contact Person</Label>
                        <p className="text-foreground font-medium">{orgData.ContactPerson}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Established Year</Label>
                        <p className="text-foreground font-medium">{orgData.EstYear}</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Motto</Label>
                      <p className="text-foreground font-medium mt-1">{orgData.SchoolMoto}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="Email">Email Address *</Label>
                      <Input
                        id="Email"
                        type="Email"
                        {...register("Email")}
                        placeholder="organization@Email.com"
                      />
                      {errors.Email && <p className="text-sm text-destructive">{errors.Email.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="Web">Website</Label>
                      <Input
                        id="Web"
                        {...register("Web")}
                        placeholder="https://example.com"
                      />
                      {errors.Web && <p className="text-sm text-destructive">{errors.Web.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="Phone">Phone Number *</Label>
                      <Input
                        id="Phone"
                        {...register("Phone")}
                        placeholder="Phone number"
                      />
                      {errors.Phone && <p className="text-sm text-destructive">{errors.Phone.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="Mobile">Mobile Number *</Label>
                      <Input
                        id="Mobile"
                        {...register("Mobile")}
                        placeholder="Mobile number"
                      />
                      {errors.Mobile && <p className="text-sm text-destructive">{errors.Mobile.message}</p>}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Email Address</Label>
                      <p className="text-foreground font-medium">{orgData.Email}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Website</Label>
                      <a href={orgData.Web} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                        <Globe className="h-4 w-4" />
                        {orgData.Web}
                      </a>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Phone</Label>
                      <p className="text-foreground font-medium">{orgData.Phone}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Mobile</Label>
                      <p className="text-foreground font-medium">{orgData.Mobile}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Address Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="Address1">Address Line 1 *</Label>
                      <Textarea
                        id="Address1"
                        {...register("Address1")}
                        placeholder="Street address, P.O. box"
                        rows={2}
                      />
                      {errors.Address1 && <p className="text-sm text-destructive">{errors.Address1.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="Address2">Address Line 2</Label>
                      <Textarea
                        id="Address2"
                        {...register("Address2")}
                        placeholder="Apartment, suite, unit, building, floor"
                        rows={2}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="City">City *</Label>
                        <Input id="City" {...register("City")} />
                        {errors.City && <p className="text-sm text-destructive">{errors.City.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="State">State *</Label>
                        <Input id="State" {...register("State")} />
                        {errors.State && <p className="text-sm text-destructive">{errors.State.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="Country">Country *</Label>
                        <Input id="Country" {...register("Country")} />
                        {errors.Country && <p className="text-sm text-destructive">{errors.Country.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="PinNo">PIN Code *</Label>
                        <Input id="PinNo" {...register("PinNo")} />
                        {errors.PinNo && <p className="text-sm text-destructive">{errors.PinNo.message}</p>}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <Label className="text-muted-foreground">Primary Address</Label>
                      <p className="text-foreground font-medium">{orgData.Address1}</p>
                    </div>
                    {orgData.Address2 && (
                      <div>
                        <Label className="text-muted-foreground">Secondary Address</Label>
                        <p className="text-foreground font-medium">{orgData.Address2}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label className="text-muted-foreground">City</Label>
                        <p className="text-foreground font-medium">{orgData.City}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">State</Label>
                        <p className="text-foreground font-medium">{orgData.State}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Country</Label>
                        <p className="text-foreground font-medium">{orgData.Country}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">PIN Code</Label>
                        <p className="text-foreground font-medium">{orgData.PinNo}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Sidebar Information */}
          <motion.div
            initial={{ opaCity: 0, x: 20 }}
            animate={{ opaCity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="space-y-6"
          >
            {/* Legal Information */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Legal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isEditing ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="PANNo">PAN Number *</Label>
                      <Input id="PANNo" {...register("PANNo")} placeholder="ABCDE1234F" />
                      {errors.PANNo && <p className="text-sm text-destructive">{errors.PANNo.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="GSTINNo">GSTIN Number *</Label>
                      <Input id="GSTINNo" {...register("GSTINNo")} placeholder="22ABCDE1234F1Z5" />
                      {errors.GSTINNo && <p className="text-sm text-destructive">{errors.GSTINNo.message}</p>}
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <Label className="text-muted-foreground">PAN Number</Label>
                      <p className="text-foreground font-medium font-mono">{orgData.PANNo}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">GSTIN Number</Label>
                      <p className="text-foreground font-medium font-mono">{orgData.GSTINNo}</p>
                    </div>
                    {orgData.RegistrationNo && (
                      <div>
                        <Label className="text-muted-foreground">Registration No.</Label>
                        <p className="text-foreground font-medium">{orgData.RegistrationNo}</p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Subscription Information */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Subscription
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-muted-foreground">Plan Type</Label>
                  <Badge variant="outline" className="mt-1">{orgData.SubsType}</Badge>
                </div>
                <Separator />
                <div>
                  <Label className="text-muted-foreground">Subscription From</Label>
                  <p className="text-foreground font-medium">{formatDate(orgData.SubsFrom)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Subscription To</Label>
                  <p className="text-foreground font-medium">{formatDate(orgData.SubsTo)}</p>
                </div>
                <div className="pt-2">
                  <Badge variant={new Date(orgData.SubsTo) > new Date() ? "default" : "destructive"}>
                    {new Date(orgData.SubsTo) > new Date() ? "Active" : "Expired"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* System Information */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  System Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-muted-foreground">Organization Code</Label>
                  <p className="text-foreground font-medium font-mono">{orgData.OrgCode}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Organization ID</Label>
                  <p className="text-foreground font-medium">{orgData.OrgID}</p>
                </div>
                <Separator />
                <div>
                  <Label className="text-muted-foreground">Created Date</Label>
                  <p className="text-foreground font-medium">{formatDate(orgData.TransDate)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Last Updated</Label>
                  <p className="text-foreground font-medium">{formatDate(orgData.TranDateUpdate)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Social Links */}
            {orgData.SocialLinkedIn && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground flex items-center gap-2">
                    <Link className="h-5 w-5" />
                    Social Links
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {orgData.SocialLinkedIn && (
                      <a 
                        href={orgData.SocialLinkedIn} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-primary hover:underline text-sm"
                      >
                        <Eye className="h-4 w-4" />
                        LinkedIn Profile
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  )
}