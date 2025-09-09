"use client"

import { useState } from "react"
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
import { User, Building, Mail, Phone, Calendar, FileText, Camera, Save, Edit3, Shield, Clock } from "lucide-react"
import { toast } from "sonner"

const profileSchema = z.object({
  userName: z.string().min(2, "Name must be at least 2 characters"),
  userEmail: z.string().email("Please enter a valid email address"),
  userDOB: z.string().min(1, "Date of birth is required"),
  userType: z.string().min(1, "Please select a user type"),
  mobile: z.string().min(10, "Please enter a valid mobile number"),
  aboutUs: z.string().min(10, "Please provide at least 10 characters about yourself"),
})

type ProfileFormData = z.infer<typeof profileSchema>

export function ProfileForm() {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      userName: user?.UserName || "",
      userEmail: user?.UserEmail || "",
      userDOB: user?.UserDOB || "",
      userType: user?.UserType || "",
      mobile: user?.Mobile || "",
      aboutUs: user?.AboutUs || "",
    },
  })

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true)
    try {
      // Simulate API call - replace with actual update logic
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success("Profile updated successfully!")
      setIsEditing(false)
    } catch (error) {
      toast.error("Failed to update profile. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (!user) return null

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user.UserPhoto || "/placeholder.svg"} alt={user.UserName} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                    {getInitials(user.UserName)}
                  </AvatarFallback>
                </Avatar>
                <Button size="sm" variant="secondary" className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0">
                  <Camera className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl font-bold text-foreground">{user.UserName}</h1>
                <p className="text-muted-foreground">{user.UserEmail}</p>
                <div className="flex flex-wrap gap-2 mt-2 justify-center md:justify-start">
                  <Badge variant="secondary">{user.UserType}</Badge>
                  <Badge variant={user.Status === "Active" ? "default" : "destructive"}>{user.Status}</Badge>
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
                      <Label htmlFor="userName" className="text-foreground">
                        Full Name
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="userName"
                          placeholder="Enter your full name"
                          className="pl-10 bg-input border-border text-foreground"
                          {...register("userName")}
                        />
                      </div>
                      {errors.userName && <p className="text-sm text-destructive">{errors.userName.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="userEmail" className="text-foreground">
                        Email Address
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="userEmail"
                          type="email"
                          placeholder="Enter your email"
                          className="pl-10 bg-input border-border text-foreground"
                          {...register("userEmail")}
                        />
                      </div>
                      {errors.userEmail && <p className="text-sm text-destructive">{errors.userEmail.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="userDOB" className="text-foreground">
                        Date of Birth
                      </Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="userDOB"
                          type="date"
                          className="pl-10 bg-input border-border text-foreground"
                          {...register("userDOB")}
                        />
                      </div>
                      {errors.userDOB && <p className="text-sm text-destructive">{errors.userDOB.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mobile" className="text-foreground">
                        Mobile Number
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="mobile"
                          type="tel"
                          placeholder="Enter mobile number"
                          className="pl-10 bg-input border-border text-foreground"
                          {...register("mobile")}
                        />
                      </div>
                      {errors.mobile && <p className="text-sm text-destructive">{errors.mobile.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="userType" className="text-foreground">
                      User Type
                    </Label>
                    <Select onValueChange={(value) => setValue("userType", value)} defaultValue={user.UserType}>
                      <SelectTrigger className="bg-input border-border text-foreground">
                        <SelectValue placeholder="Select user type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Employee">Employee</SelectItem>
                        <SelectItem value="Manager">Manager</SelectItem>
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="HR">HR</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.userType && <p className="text-sm text-destructive">{errors.userType.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="aboutUs" className="text-foreground">
                      About You
                    </Label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Textarea
                        id="aboutUs"
                        placeholder="Tell us about yourself..."
                        className="pl-10 bg-input border-border text-foreground min-h-[100px]"
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
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                        className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full mr-2"
                      />
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
                      <p className="text-foreground font-medium">{user.UserName}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Email Address</Label>
                      <p className="text-foreground font-medium">{user.UserEmail}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Date of Birth</Label>
                      <p className="text-foreground font-medium">{formatDate(user.UserDOB)}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Mobile Number</Label>
                      <p className="text-foreground font-medium">{user.Mobile}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">User Type</Label>
                      <p className="text-foreground font-medium">{user.UserType}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Login ID</Label>
                      <p className="text-foreground font-medium">{user.LoginId}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">About</Label>
                    <p className="text-foreground font-medium mt-1">{user.AboutUs}</p>
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
          {/* Organization Details */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground flex items-center gap-2">
                <Building className="h-5 w-5" />
                Organization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-muted-foreground">Employee Code</Label>
                <p className="text-foreground font-medium">{user.EmployeeCode}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Organization Code</Label>
                <p className="text-foreground font-medium">{user.OrgCode}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">User ID</Label>
                <p className="text-foreground font-medium">{user.UserId}</p>
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
                  <Badge variant={user.Status === "Active" ? "default" : "destructive"}>{user.Status}</Badge>
                </div>
              </div>
              <Separator />
              <div>
                <Label className="text-muted-foreground">Member Since</Label>
                <p className="text-foreground font-medium">{formatDate(user.TransDate)}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Last Updated</Label>
                <p className="text-foreground font-medium">{formatDate(user.TranDateUpdate)}</p>
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
                <Label className="text-muted-foreground">Created By</Label>
                <p className="text-foreground font-medium">{user.TransBy}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Updated By</Label>
                <p className="text-foreground font-medium">{user.TranByUpdate}</p>
              </div>
              {user.TranDateDel && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-muted-foreground">Deleted Date</Label>
                    <p className="text-foreground font-medium">{formatDate(user.TranDateDel)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Deleted By</Label>
                    <p className="text-foreground font-medium">{user.TranByDel}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
