"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { DashboardLayout } from "@/components/dashboard-layout"
import Link from "next/link"

interface UserInterface {
  UserId: number
  EmployeeCode: string
  OrgCode: number
  UserName: string
  UserEmail: string
  UserDOB: string
  UserPhoto: string
  LoginId: string
  Mobile: string
  AboutUs: string
  Status: "Active" | "Inactive"
}

export default function EditUserPage({ params }: { params: { id: string } }) {
  const [user, setUser] = useState<UserInterface | null>(null)

  const [formData, setFormData] = useState({
    EmployeeCode: "",
    LoginId: "",
    LoginPwd: "", // ✅ added (plain text password to update)
    UserName: "",
    UserEmail: "",
    UserDOB: "",
    Mobile: "",
    AboutUs: "",
    Status: "Active",
  })

  const [userPhoto, setUserPhoto] = useState<File | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchUser()
  }, [params.id])

  const fetchUser = async () => {
    try {
      setLoading(true)
      const response = await fetch(`https://api.smartcorpweb.com/api/users/${params.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        setFormData({
          EmployeeCode: userData.EmployeeCode || "",
          LoginId: userData.LoginId || "",
          LoginPwd: "", // leave empty on load
          UserName: userData.UserName || "",
          UserEmail: userData.UserEmail || "",
          UserDOB: userData.UserDOB ? userData.UserDOB.split("T")[0] : "",
          Mobile: userData.Mobile || "",
          AboutUs: userData.AboutUs || "",
          Status: userData.Status || "Active",
        })
      } else {
        throw new Error("Failed to fetch user")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch user details",
        variant: "destructive",
      })
      router.push("/user-management")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUserPhoto(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.UserName || !formData.UserEmail) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      setUpdating(true)

      const submitData = new FormData()
      submitData.append("UserName", formData.UserName)
      submitData.append("UserEmail", formData.UserEmail)
      submitData.append("EmployeeCode", formData.EmployeeCode)
      submitData.append("LoginId", formData.LoginId)

      if (formData.LoginPwd) {
        submitData.append("LoginPwd", formData.LoginPwd) // ✅ send password only if entered
      }

      submitData.append("UserDOB", formData.UserDOB)
      submitData.append("Mobile", formData.Mobile)
      submitData.append("AboutUs", formData.AboutUs)
      submitData.append("Status", formData.Status)

      if (userPhoto) {
        submitData.append("UserPhoto", userPhoto)
      } else {
        submitData.append("ExistingUserPhoto", user?.UserPhoto || "")
      }

      const response = await fetch(`https://api.smartcorpweb.com/api/users/${params.id}`, {
        method: "PUT",
        body: submitData,
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "User updated successfully",
        })
        router.push("/user-management")
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">Loading...</div>
      </DashboardLayout>
    )
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <h3 className="text-lg font-semibold text-muted-foreground">User not found</h3>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
          <Link href="/user-management">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.UserPhoto ? `https://api.smartcorpweb.com${user.UserPhoto}` : undefined} />
              <AvatarFallback>
                {user.UserName.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Edit User</h1>
              <p className="text-muted-foreground">Update user information and settings</p>
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="UserName">Full Name *</Label>
                  <Input
                    id="UserName"
                    value={formData.UserName}
                    onChange={(e) => handleInputChange("UserName", e.target.value)}
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="EmployeeCode">Employee Code</Label>
                  <Input
                    id="EmployeeCode"
                    value={formData.EmployeeCode}
                    onChange={(e) => handleInputChange("EmployeeCode", e.target.value)}
                    placeholder="Enter employee code"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="UserEmail">Email Address *</Label>
                  <Input
                    id="UserEmail"
                    type="email"
                    value={formData.UserEmail}
                    onChange={(e) => handleInputChange("UserEmail", e.target.value)}
                    placeholder="Enter email address"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="Mobile">Mobile Number</Label>
                  <Input
                    id="Mobile"
                    value={formData.Mobile}
                    onChange={(e) => handleInputChange("Mobile", e.target.value)}
                    placeholder="Enter mobile number"
                    maxLength={10}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="UserDOB">Date of Birth</Label>
                  <Input
                    id="UserDOB"
                    type="date"
                    value={formData.UserDOB}
                    onChange={(e) => handleInputChange("UserDOB", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="LoginId">Login ID</Label>
                  <Input
                    id="LoginId"
                    value={formData.LoginId}
                    onChange={(e) => handleInputChange("LoginId", e.target.value)}
                    placeholder="Enter login ID"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="LoginPwd">Password</Label>
                  <Input
                    id="LoginPwd"
                    type="password"
                    value={formData.LoginPwd}
                    onChange={(e) => handleInputChange("LoginPwd", e.target.value)}
                    placeholder="Enter new password (leave blank to keep current)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="Status">Status</Label>
                  <Select value={formData.Status} onValueChange={(value) => handleInputChange("Status", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="UserPhoto">Profile Photo</Label>
                  <Input id="UserPhoto" type="file" accept="image/*" onChange={handleFileChange} />

                  {userPhoto ? (
                    <img src={URL.createObjectURL(userPhoto)} alt="Preview" className="w-20 h-20 rounded object-cover mt-2" />
                  ) : (
                    user?.UserPhoto && (
                      <img src={`https://api.smartcorpweb.com${user.UserPhoto}`} alt="Current" className="w-20 h-20 rounded object-cover mt-2" />
                    )
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="AboutUs">About</Label>
                  <Textarea
                    id="AboutUs"
                    value={formData.AboutUs}
                    onChange={(e) => handleInputChange("AboutUs", e.target.value)}
                    placeholder="Enter user description"
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Link href="/user-management">
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={updating}>
              {updating ? (
                <>
                  <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Update User
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
