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
import { User, Building, Mail, Phone, Calendar, FileText, Camera, Save, Edit3, Shield, Clock, IdCard } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { DashboardLayout } from "@/components/dashboard-layout"

const profileSchema = z.object({
  userName: z.string().min(2, "Name must be at least 2 characters"),
  userEmail: z.string().email("Please enter a valid email address"),
  userDOB: z.string().min(1, "Date of birth is required"),
  mobile: z.string().min(10, "Please enter a valid mobile number"),
  aboutUs: z.string().min(10, "Please provide at least 10 characters about yourself"),
})

type ProfileFormData = z.infer<typeof profileSchema>

interface UserProfile {
  UserId: number
  EmployeeCode: string
  OrgCode: number
  UserName: string
  UserEmail: string
  UserDOB: string
  UserPhoto: string | null
  LoginId: string
  PwdChangeDate: string | null
  Mobile: string
  AboutUs: string
  Status: string
  TransDate: string
  TransBy: string
  TranDateUpdate: string | null
  TranByUpdate: string | null
  TranDateDel: string | null
  TranByDel: string | null
}

export default function UserProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [userData, setUserData] = useState<UserProfile | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string>("")
  const { toast } = useToast()
  const { user } = useAuth()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  })

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      // Replace '1' with dynamic user ID from auth context if needed
      const response = await fetch("https://api.smartcorpweb.com/api/users/profile/" + user?.id)
      if (response.ok) {
        const data = await response.json()
        setUserData(data)
        
        if (data.UserPhoto) {
          setPhotoPreview(`https://api.smartcorpweb.com${data.UserPhoto}`)
        }
        
        // Reset form with fetched data
        reset({
          userName: data.UserName,
          userEmail: data.UserEmail,
          userDOB: data.UserDOB ? new Date(data.UserDOB).toISOString().split('T')[0] : "",
          mobile: data.Mobile,
          aboutUs: data.AboutUs,
        })
      } else {
        throw new Error("Failed to fetch user profile")
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
      toast({
        title: "Error",
        description: "Failed to load user profile",
        variant: "destructive",
      })
    }
  }

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true)
    try {
      const formData = new FormData()
      
      // Append all form data
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value as string)
      })
      
      if (photoFile) {
        formData.append("userPhoto", photoFile)
      }

      // Update user profile - replace with your actual endpoint
      const response = await fetch(`https://api.smartcorpweb.com/api/users/profile/${user?.id}`, {
        method: "PUT",
        body: formData,
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Profile updated successfully!",
        })
        setIsEditing(false)
        fetchUserProfile() // Refresh data
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

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoFile(file)
      setPhotoPreview(URL.createObjectURL(file))
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not available"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "Not available"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const calculateAge = (dobString: string) => {
    if (!dobString) return null
    const dob = new Date(dobString)
    const today = new Date()
    let age = today.getFullYear() - dob.getFullYear()
    const monthDiff = today.getMonth() - dob.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--
    }
    
    return age
  }

  if (!userData) {
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
        {/* Profile Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={photoPreview || "/placeholder.svg"} alt={userData.UserName} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                      {getInitials(userData.UserName)}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button size="sm" variant="secondary" className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0">
                      <Label htmlFor="userPhoto" className="cursor-pointer">
                        <Camera className="h-4 w-4" />
                      </Label>
                      <Input 
                        id="userPhoto" 
                        type="file" 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handlePhotoChange} 
                      />
                    </Button>
                  )}
                </div>

                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-2xl font-bold text-foreground">{userData.UserName}</h1>
                  <p className="text-muted-foreground">{userData.UserEmail}</p>
                  <p className="text-sm text-muted-foreground mt-1">{userData.AboutUs}</p>
                  <div className="flex flex-wrap gap-2 mt-2 justify-center md:justify-start">
                    <Badge variant="secondary">{userData.EmployeeCode}</Badge>
                    <Badge variant={userData.Status === "Active" ? "default" : "destructive"}>
                      {userData.Status}
                    </Badge>
                    {userData.UserDOB && (
                      <Badge variant="outline">
                        {calculateAge(userData.UserDOB)} years
                      </Badge>
                    )}
                  </div>
                </div>

                {/* <Button
                  onClick={() => setIsEditing(!isEditing)}
                  variant={isEditing ? "outline" : "default"}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  {isEditing ? "Cancel" : "Edit Profile"}
                </Button> */}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="lg:col-span-2"
          >
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>Manage your personal details and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="userName">Full Name *</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="userName"
                            placeholder="Enter your full name"
                            className="pl-10"
                            {...register("userName")}
                          />
                        </div>
                        {errors.userName && <p className="text-sm text-destructive">{errors.userName.message}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="userEmail">Email Address *</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="userEmail"
                            type="email"
                            placeholder="Enter your email"
                            className="pl-10"
                            {...register("userEmail")}
                          />
                        </div>
                        {errors.userEmail && <p className="text-sm text-destructive">{errors.userEmail.message}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="userDOB">Date of Birth *</Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="userDOB"
                            type="date"
                            className="pl-10"
                            {...register("userDOB")}
                          />
                        </div>
                        {errors.userDOB && <p className="text-sm text-destructive">{errors.userDOB.message}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="mobile">Mobile Number *</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="mobile"
                            type="tel"
                            placeholder="Enter mobile number"
                            className="pl-10"
                            {...register("mobile")}
                          />
                        </div>
                        {errors.mobile && <p className="text-sm text-destructive">{errors.mobile.message}</p>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="aboutUs">About You *</Label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Textarea
                          id="aboutUs"
                          placeholder="Tell us about yourself, your role, and your interests..."
                          className="pl-10 min-h-[100px]"
                          {...register("aboutUs")}
                        />
                      </div>
                      {errors.aboutUs && <p className="text-sm text-destructive">{errors.aboutUs.message}</p>}
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                      disabled={isLoading}
                    >
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
                        <Label className="text-muted-foreground">Full Name</Label>
                        <p className="text-foreground font-medium">{userData.UserName}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Email Address</Label>
                        <p className="text-foreground font-medium">{userData.UserEmail}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Date of Birth</Label>
                        <p className="text-foreground font-medium">
                          {userData.UserDOB ? formatDate(userData.UserDOB) : "Not set"}
                          {userData.UserDOB && (
                            <span className="text-sm text-muted-foreground ml-2">
                              ({calculateAge(userData.UserDOB)} years)
                            </span>
                          )}
                        </p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Mobile Number</Label>
                        <p className="text-foreground font-medium">{userData.Mobile}</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">About</Label>
                      <p className="text-foreground font-medium mt-1">{userData.AboutUs}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* System Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="space-y-6"
          >
            {/* Identification Details */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center gap-2">
                  <IdCard className="h-5 w-5" />
                  Identification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-muted-foreground">Employee Code</Label>
                  <p className="text-foreground font-medium font-mono">{userData.EmployeeCode}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">User ID</Label>
                  <p className="text-foreground font-medium">#{userData.UserId}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Login ID</Label>
                  <p className="text-foreground font-medium">{userData.LoginId}</p>
                </div>
                <Separator />
                <div>
                  <Label className="text-muted-foreground">Organization Code</Label>
                  <p className="text-foreground font-medium">{userData.OrgCode}</p>
                </div>
              </CardContent>
            </Card>

            {/* Account Status */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Account Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={userData.Status === "Active" ? "default" : "destructive"}>
                      {userData.Status}
                    </Badge>
                  </div>
                </div>
                <Separator />
               
              </CardContent>
            </Card>

            {/* System Information */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  System Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-muted-foreground">Member Since</Label>
                  <p className="text-foreground font-medium">{formatDateTime(userData.TransDate)}</p>
                </div>
               
                
              
                            </CardContent>
            </Card>

             </motion.div>
        </div>
      </div>
    </DashboardLayout>
  )
}