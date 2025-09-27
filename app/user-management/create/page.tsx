"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { DashboardLayout } from "@/components/dashboard-layout"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"

export default function CreateUserPage() {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    EmployeeCode: "",
    UserName: "",
    UserEmail: "",
    UserDOB: "",
    LoginId: "",
    LoginPwd: "",
    Mobile: "",
    AboutUs: "",
    Status: "Active",
  })
  const [userPhoto, setUserPhoto] = useState<File | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // Mock OrgCode - in real app, this would come from auth provider
  const orgCode = user?.OrgCode

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

    if (!formData.UserName || !formData.UserEmail || !formData.LoginId || !formData.LoginPwd) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      const submitData = new FormData()
      submitData.append("EmployeeCode", formData.EmployeeCode)
      submitData.append("OrgCode", orgCode)
      submitData.append("UserName", formData.UserName)
      submitData.append("UserEmail", formData.UserEmail)
      submitData.append("UserDOB", formData.UserDOB)
      submitData.append("LoginId", formData.LoginId)
      submitData.append("LoginPwd", formData.LoginPwd)
      submitData.append("Mobile", formData.Mobile)
      submitData.append("AboutUs", formData.AboutUs)

      if (userPhoto) {
        submitData.append("UserPhoto", userPhoto)
      }

      const response = await fetch("https://api.smartcorpweb.com/api/users/register", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: submitData,
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "User created successfully",
        })
        router.push("/user-management")
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create user",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
       
          <div>
            <h1 className="text-2xl font-bold text-foreground">User(New)</h1>
          
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
                  <Label htmlFor="LoginId">Login ID *</Label>
                  <Input
                    id="LoginId"
                    value={formData.LoginId}
                    onChange={(e) => handleInputChange("LoginId", e.target.value)}
                    placeholder="Enter login ID"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="LoginPwd">Password *</Label>
                  <div className="relative">
                    <Input
                      id="LoginPwd"
                      type={showPassword ? "text" : "password"}
                      value={formData.LoginPwd}
                      onChange={(e) => handleInputChange("LoginPwd", e.target.value)}
                      placeholder="Enter password"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="UserPhoto">Profile Photo</Label>
                  <Input id="UserPhoto" type="file" accept="image/*" onChange={handleFileChange} />
                  {userPhoto && <p className="text-sm text-muted-foreground">Selected: {userPhoto.name}</p>}
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
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create User
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
