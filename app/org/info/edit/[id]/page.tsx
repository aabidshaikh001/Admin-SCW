"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Building2, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { orgApi } from "@/lib/api"
import { DashboardLayout } from "@/components/dashboard-layout"
import Link from "next/link"
import { masterApi } from "@/lib/master-api" // Import the master API service

// Define types for location data
interface Country {
  CountryCode: number
  CountryName: string
}

interface State {
  StateId?: number
  StateCode: string
  StateName: string
}

interface City {
  CityId?: number
  CityName: string
}

interface Organization {
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
  AdminEmail: string
  WebAdminEmail: string
  WAMsgVisit: string
  WAMsgBusiness: string
  Status: string
  SocialFB: string
  SocialInsta: string
  SocialTwitter: string
  SocialLinkedIn: string
  SocialYoutube: string
  SocialPinterest: string
  Favicon: string
}

export default function EditOrganizationPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [faviconFile, setFaviconFile] = useState<File | null>(null)
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null)
  
  // State for location data
  const [countries, setCountries] = useState<Country[]>([])
  const [states, setStates] = useState<State[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [loadingCountries, setLoadingCountries] = useState(true)
  const [loadingStates, setLoadingStates] = useState(false)
  const [loadingCities, setLoadingCities] = useState(false)

  const [formData, setFormData] = useState({
    OrgCode: "",
    OrgType: "",
    OrgName: "",
    ContactPerson: "",
    EstYear: "",
    MultiBranch: "",
    AffiliatedTo: "",
    AffiliationNo: "",
    SchoolMoto: "",
    RegistrationNo: "",
    BoardUniversity: "",
    Web: "",
    Address1: "",
    Address2: "",
    Country: "",
    State: "",
    City: "",
    PinNo: "",
    Phone: "",
    Mobile: "",
    Email: "",
    PANNo: "",
    GSTINNo: "",
    ACHolderName: "",
    BankAccount: "",
    BankCode: "",
    BankBranch: "",
    BankIFSC: "",
    SubsType: "",
    SubsFrom: "",
    SubsTo: "",
    AdminEmail: "",
    AdminPwd: "",
    WebAdminEmail: "",
    WebAdminPwd: "",
    WAMsgVisit: "",
    WAMsgBusiness: "",
    Status: "Active",
    SocialFB: "",
    SocialInsta: "",
    SocialTwitter: "",
    SocialLinkedIn: "",
    SocialYoutube: "",
    SocialPinterest: "",
    Favicon: "",
  })

  // Fetch countries on component mount
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoadingCountries(true)
        const countriesData = await masterApi.getCountries()
        setCountries(countriesData)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load countries",
          variant: "destructive",
        })
      } finally {
        setLoadingCountries(false)
      }
    }
    
    fetchCountries()
  }, [toast])

  // Fetch states when country changes
  useEffect(() => {
    const fetchStates = async () => {
      if (!formData.Country) {
        setStates([])
        setCities([])
        return
      }
      
      try {
        setLoadingStates(true)
        const countryId = parseInt(formData.Country)
        const statesData = await masterApi.getStatesByCountry(countryId)
        setStates(statesData)
        setCities([]) // Reset cities when country changes
        // Don't reset state selection if it's already set from the organization data
        if (!organization) {
          setFormData(prev => ({ ...prev, State: "", City: "" }))
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load states",
          variant: "destructive",
        })
      } finally {
        setLoadingStates(false)
      }
    }
    
    fetchStates()
  }, [formData.Country, toast, organization])

  // Fetch cities when state changes
  useEffect(() => {
    const fetchCities = async () => {
      if (!formData.State) {
        setCities([])
        return
      }
      
      try {
        setLoadingCities(true)
        const stateId = parseInt(formData.State)
        const citiesData = await masterApi.getCitiesByState(stateId)
        setCities(citiesData)
        // Don't reset city selection if it's already set from the organization data
        if (!organization) {
          setFormData(prev => ({ ...prev, City: "" }))
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load cities",
          variant: "destructive",
        })
      } finally {
        setLoadingCities(false)
      }
    }
    
    fetchCities()
  }, [formData.State, toast, organization])

  useEffect(() => {
    if (params.id) {
      fetchOrganization()
    }
  }, [params.id])

  const fetchOrganization = async () => {
    try {
      setFetchLoading(true)
      const data = await orgApi.getById(params.id as string)
      setOrganization(data)

      // Populate form data
      setFormData({
        OrgCode: data.OrgCode?.toString() || "",
        OrgType: data.OrgType || "",
        OrgName: data.OrgName || "",
        ContactPerson: data.ContactPerson || "",
        EstYear: data.EstYear?.toString() || "",
        MultiBranch: data.MultiBranch || "",
        AffiliatedTo: data.AffiliatedTo || "",
        AffiliationNo: data.AffiliationNo || "",
        SchoolMoto: data.SchoolMoto || "",
        RegistrationNo: data.RegistrationNo || "",
        BoardUniversity: data.BoardUniversity || "",
        Web: data.Web || "",
        Address1: data.Address1 || "",
        Address2: data.Address2 || "",
        Country: data.Country || "",
        State: data.State || "",
        City: data.City || "",
        PinNo: data.PinNo?.toString() || "",
        Phone: data.Phone || "",
        Mobile: data.Mobile || "",
        Email: data.Email || "",
        PANNo: data.PANNo || "",
        GSTINNo: data.GSTINNo || "",
        ACHolderName: data.ACHolderName || "",
        BankAccount: data.BankAccount || "",
        BankCode: data.BankCode || "",
        BankBranch: data.BankBranch || "",
        BankIFSC: data.BankIFSC || "",
        SubsType: data.SubsType || "",
        SubsFrom: data.SubsFrom ? new Date(data.SubsFrom).toISOString().split("T")[0] : "",
        SubsTo: data.SubsTo ? new Date(data.SubsTo).toISOString().split("T")[0] : "",
        AdminEmail: data.AdminEmail || "",
        AdminPwd: "",
        WebAdminEmail: data.WebAdminEmail || "",
        WebAdminPwd: "",
        WAMsgVisit: data.WAMsgVisit || "",
        WAMsgBusiness: data.WAMsgBusiness || "",
        Status: data.Status || "Active",
        SocialFB: data.SocialFB || "",
        SocialInsta: data.SocialInsta || "",
        SocialTwitter: data.SocialTwitter || "",
        SocialLinkedIn: data.SocialLinkedIn || "",
        SocialYoutube: data.SocialYoutube || "",
        SocialPinterest: data.SocialPinterest || "",
        Favicon: data.Favicon || "",
      })

      // Set logo preview if exists
      if (data.Logo) {
        setLogoPreview(`https://api.smartcorpweb.com${data.Logo}`)
      }
      if (data.Favicon) {
        setFaviconPreview(`https://api.smartcorpweb.com${data.Favicon}`)
      }

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch organization details",
        variant: "destructive",
      })
    } finally {
      setFetchLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFaviconFile(file)
      const reader = new FileReader()
      reader.onload = () => setFaviconPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const removeFavicon = () => {
    setFaviconFile(null)
    setFaviconPreview(null)
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onload = () => setLogoPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const removeLogo = () => {
    setLogoFile(null)
    setLogoPreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const submitData = new FormData()

      // Add all form fields (only non-empty values)
    Object.entries(formData).forEach(([key, value]) => {
  // Skip passwords only if they are blank
  if ((key === "AdminPwd" || key === "WebAdminPwd") && !value) {
    return
  }

  // Always send other fields, even if empty string
  submitData.append(key, value ?? "")
})

      // Add logo file if selected
      if (logoFile) {
        submitData.append("Logo", logoFile)
      }

      // Add favicon file if selected
      if (faviconFile) {
        submitData.append("Favicon", faviconFile)
      }

      await orgApi.update(params.id as string, submitData)

      toast({
        title: "Success",
        description: "Organization updated successfully",
      })

      router.push("/org/info")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update organization",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!organization) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-muted-foreground">Organization not found</h2>
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
          className="flex items-center space-x-4"
        >
          <div>
            <h1 className="text-2xl font-bold text-foreground">Organization Management (Update)</h1>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <form onSubmit={handleSubmit}>
            <Tabs defaultValue="basic" className="space-y-6">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
                <TabsTrigger value="social">Social</TabsTrigger>

                <TabsTrigger value="financial">Financial</TabsTrigger>
                <TabsTrigger value="admin">Admin</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="basic">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Building2 className="w-5 h-5 mr-2" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      
                      <div className="space-y-2">
                        <Label htmlFor="orgName">Organization Name *</Label>
                        <Input
                          id="orgName"
                          value={formData.OrgName}
                          onChange={(e) => handleInputChange("OrgName", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="orgType">Organization Type</Label>
                        <Select value={formData.OrgType} onValueChange={(value) => handleInputChange("OrgType", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="School">School</SelectItem>
                            <SelectItem value="College">College</SelectItem>
                            <SelectItem value="University">University</SelectItem>
                            <SelectItem value="Institute">Institute</SelectItem>
                            <SelectItem value="Corporate">Corporate</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                     
                      <div className="space-y-2">
                        <Label htmlFor="estYear">Establishment Year</Label>
                        <Input
                          id="estYear"
                          type="number"
                          value={formData.EstYear}
                          onChange={(e) => handleInputChange("EstYear", e.target.value)}
                        />
                      </div>
                      
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="schoolMoto">About</Label>
                      <Textarea
                        id="schoolMoto"
                        value={formData.SchoolMoto}
                        onChange={(e) => handleInputChange("SchoolMoto", e.target.value)}
                        rows={3}
                      />
                    </div>
                                        {/* Logo Upload */}
                    {/* Logo & Favicon Upload in one line */}
<div className="space-y-2">
  <Label>Logo & Favicon</Label>
  <div className="flex items-center space-x-6">
    {/* Logo Upload */}
    <div className="flex items-center space-x-2">
      {logoPreview ? (
        <div className="relative">
          <img
            src={logoPreview || "/placeholder.svg"}
            alt="Logo preview"
            className="w-20 h-20 object-cover rounded-lg border"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 w-6 h-6 p-0"
            onClick={removeLogo}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      ) : (
        <div className="w-20 h-20 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
          <Upload className="w-6 h-6 text-muted-foreground" />
        </div>
      )}
      <div>
        <Input
          type="file"
          accept="image/*"
          onChange={handleLogoChange}
          className="hidden"
          id="logo-upload"
        />
        <Label htmlFor="logo-upload" className="cursor-pointer">
          <Button type="button" variant="outline" asChild>
            <span>Choose Logo</span>
          </Button>
        </Label>
      </div>
    </div>

    {/* Favicon Upload */}
    <div className="flex items-center space-x-2">
      {faviconPreview ? (
        <div className="relative">
          <img
            src={faviconPreview || "/placeholder.svg"}
            alt="Favicon preview"
            className="w-10 h-10 object-cover rounded border"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 w-6 h-6 p-0"
            onClick={removeFavicon}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      ) : (
        <div className="w-10 h-10 border-2 border-dashed border-muted-foreground/25 rounded flex items-center justify-center">
          <Upload className="w-5 h-5 text-muted-foreground" />
        </div>
      )}
      <div>
        <Input
          type="file"
          accept="image/*"
          onChange={handleFaviconChange}
          className="hidden"
          id="favicon-upload"
        />
        <Label htmlFor="favicon-upload" className="cursor-pointer">
          <Button type="button" variant="outline" asChild>
            <span>Choose Favicon</span>
          </Button>
        </Label>
      </div>
    </div>
  </div>
</div>



                  </CardContent>
                </Card>
              </TabsContent>

               <TabsContent value="contact">
                              <Card>
                                <CardHeader>
                                  <CardTitle>Contact Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                  <div className="space-y-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="address1">Address 1</Label>
                                      <Input
                                        id="address1"
                                        value={formData.Address1}
                                        onChange={(e) => handleInputChange("Address1", e.target.value)}
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="address2">Address 2</Label>
                                      <Input
                                        id="address2"
                                        value={formData.Address2}
                                        onChange={(e) => handleInputChange("Address2", e.target.value)}
                                      />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                      <div className="space-y-2">
                                        <Label htmlFor="country">Country</Label>
                                        <Select 
                                          value={formData.Country} 
                                          onValueChange={(value) => handleInputChange("Country", value)}
                                          disabled={loadingCountries}
                                        >
                                          <SelectTrigger>
                                            <SelectValue placeholder={loadingCountries ? "Loading..." : "Select country"} />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {countries.map((country) => (
                                              <SelectItem key={country.CountryCode} value={country.CountryCode.toString()}>
                                                {country.CountryName}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="state">State</Label>
                                        <Select 
                                          value={formData.State} 
                                          onValueChange={(value) => handleInputChange("State", value)}
                                          disabled={!formData.Country || loadingStates}
                                        >
                                          <SelectTrigger>
                                            <SelectValue placeholder={loadingStates ? "Loading..." : "Select state"} />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {states.map((state) => (
                                              <SelectItem key={state.StateCode} value={state.StateCode}>
                                                {state.StateName}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="city">City</Label>
                                        <Select 
                                          value={formData.City} 
                                          onValueChange={(value) => handleInputChange("City", value)}
                                          disabled={!formData.State || loadingCities}
                                        >
                                          <SelectTrigger>
                                            <SelectValue placeholder={loadingCities ? "Loading..." : "Select city"} />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {cities.map((city) => (
                                              <SelectItem key={city.CityId || city.CityName} value={city.CityId?.toString() || city.CityName}>
                                                {city.CityName}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="pinNo">PIN Code</Label>
                                        <Input
                                          id="pinNo"
                                          value={formData.PinNo}
                                          onChange={(e) => handleInputChange("PinNo", e.target.value)}
                                        />
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <Label htmlFor="contactPerson">Contact Person</Label>
                                        <Input
                                          id="contactPerson"
                                          value={formData.ContactPerson}
                                          onChange={(e) => handleInputChange("ContactPerson", e.target.value)}
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="phone">Phone</Label>
                                        <Input
                                          id="phone"
                                          value={formData.Phone}
                                          onChange={(e) => handleInputChange("Phone", e.target.value)}
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="mobile">Mobile</Label>
                                        <Input
                                          id="mobile"
                                          value={formData.Mobile}
                                          onChange={(e) => handleInputChange("Mobile", e.target.value)}
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                          id="email"
                                          type="email"
                                          value={formData.Email}
                                          onChange={(e) => handleInputChange("Email", e.target.value)}
                                        />
                                      </div>
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="web">Website</Label>
                                      <Input
                                        id="web"
                                        type="url"
                                        value={formData.Web}
                                        onChange={(e) => handleInputChange("Web", e.target.value)}
                                      />
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </TabsContent>
              <TabsContent value="social">
  <Card>
    <CardHeader>
      <CardTitle>Social Media Links & Favicon</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      
      {/* Social links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="socialFB">Facebook</Label>
          <Input
            id="socialFB"
            value={formData.SocialFB}
            onChange={(e) => handleInputChange("SocialFB", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="socialInsta">Instagram</Label>
          <Input
            id="socialInsta"
            value={formData.SocialInsta}
            onChange={(e) => handleInputChange("SocialInsta", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="socialTwitter">Twitter</Label>
          <Input
            id="socialTwitter"
            value={formData.SocialTwitter}
            onChange={(e) => handleInputChange("SocialTwitter", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="socialLinkedIn">LinkedIn</Label>
          <Input
            id="socialLinkedIn"
            value={formData.SocialLinkedIn}
            onChange={(e) => handleInputChange("SocialLinkedIn", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="socialYoutube">YouTube</Label>
          <Input
            id="socialYoutube"
            value={formData.SocialYoutube}
            onChange={(e) => handleInputChange("SocialYoutube", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="socialPinterest">Pinterest</Label>
          <Input
            id="socialPinterest"
            value={formData.SocialPinterest}
            onChange={(e) => handleInputChange("SocialPinterest", e.target.value)}
          />
        </div>
      </div>

      

    </CardContent>
  </Card>
</TabsContent>


              <TabsContent value="financial">
                <Card>
                  <CardHeader>
                    <CardTitle>Financial Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="panNo">PAN Number</Label>
                        <Input
                          id="panNo"
                          value={formData.PANNo}
                          onChange={(e) => handleInputChange("PANNo", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gstinNo">GST Number</Label>
                        <Input
                          id="gstinNo"
                          value={formData.GSTINNo}
                          onChange={(e) => handleInputChange("GSTINNo", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="acHolderName">Bank Account Name</Label>
                        <Input
                          id="acHolderName"
                          value={formData.ACHolderName}
                          onChange={(e) => handleInputChange("ACHolderName", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bankAccount">Bank Account No.</Label>
                        <Input
                          id="bankAccount"
                          value={formData.BankAccount}
                          onChange={(e) => handleInputChange("BankAccount", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bankCode">Bank Name</Label>
                        <Input
                          id="bankCode"
                          value={formData.BankCode}
                          onChange={(e) => handleInputChange("BankCode", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bankBranch">Branch Name</Label>
                        <Input
                          id="bankBranch"
                          value={formData.BankBranch}
                          onChange={(e) => handleInputChange("BankBranch", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bankIFSC">IFSC Code</Label>
                        <Input
                          id="bankIFSC"
                          value={formData.BankIFSC}
                          onChange={(e) => handleInputChange("BankIFSC", e.target.value)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="admin">
                <Card>
                  <CardHeader>
                    <CardTitle>Admin Credentials</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="adminEmail">Admin Email</Label>
                        <Input
                          id="adminEmail"
                          type="email"
                          value={formData.AdminEmail}
                          onChange={(e) => handleInputChange("AdminEmail", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="adminPwd">Admin Password</Label>
                        <Input
                          id="adminPwd"
                          type="password"
                          value={formData.AdminPwd}
                          onChange={(e) => handleInputChange("AdminPwd", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="webAdminEmail">Web Admin Email</Label>
                        <Input
                          id="webAdminEmail"
                          type="email"
                          value={formData.WebAdminEmail}
                          onChange={(e) => handleInputChange("WebAdminEmail", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="webAdminPwd">Web Admin Password</Label>
                        <Input
                          id="webAdminPwd"
                          type="password"
                          value={formData.WebAdminPwd}
                          onChange={(e) => handleInputChange("WebAdminPwd", e.target.value)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Additional Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
{/* Subscription & Status Row */}
<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
  <div className="space-y-2">
    <Label htmlFor="subsType">Subscription Type</Label>
    <Select
      value={formData.SubsType}
      onValueChange={(value) => handleInputChange("SubsType", value)}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select subscription" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="Basic">Basic</SelectItem>
        <SelectItem value="Premium">Premium</SelectItem>
        <SelectItem value="Enterprise">Enterprise</SelectItem>
      </SelectContent>
    </Select>
  </div>

  <div className="space-y-2">
    <Label htmlFor="status">Status</Label>
    <Select value={formData.Status} onValueChange={(value) => handleInputChange("Status", value)}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="Active">Active</SelectItem>
        <SelectItem value="Inactive">Inactive</SelectItem>
      </SelectContent>
    </Select>
  </div>

  <div className="space-y-2">
    <Label htmlFor="subsFrom">Subscription From</Label>
    <Input
      id="subsFrom"
      type="date"
      value={formData.SubsFrom}
      onChange={(e) => handleInputChange("SubsFrom", e.target.value)}
    />
  </div>

  <div className="space-y-2">
    <Label htmlFor="subsTo">Subscription To</Label>
    <Input
      id="subsTo"
      type="date"
      value={formData.SubsTo}
      onChange={(e) => handleInputChange("SubsTo", e.target.value)}
    />
  </div>
</div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="waMsgVisit">WhatsApp Visit Message</Label>
                        <Textarea
                          id="waMsgVisit"
                          value={formData.WAMsgVisit}
                          onChange={(e) => handleInputChange("WAMsgVisit", e.target.value)}
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="waMsgBusiness">WhatsApp Business Message</Label>
                        <Textarea
                          id="waMsgBusiness"
                          value={formData.WAMsgBusiness}
                          onChange={(e) => handleInputChange("WAMsgBusiness", e.target.value)}
                          rows={3}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6">
              <Link href="/org/info">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
