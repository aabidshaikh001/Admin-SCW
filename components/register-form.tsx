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
import { useAuth } from "@/contexts/auth-context"
import { Eye, EyeOff, User, Building, Mail, Phone, Calendar, FileText } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

const registerSchema = z.object({
  EmployeeCode: z.string().min(1, "Employee code is required"),
  OrgCode: z.string().min(1, "Organization code is required"),
  UserName: z.string().min(2, "Name must be at least 2 characters"),
  UserEmail: z.string().email("Please enter a valid email address"),
  UserDOB: z.string().min(1, "Date of birth is required"),
  UserType: z.string().min(1, "Please select a user type"),
  LoginId: z.string().email("Please enter a valid email address"),
  LoginPwd: z.string().min(6, "Password must be at least 6 characters"),
  Mobile: z.string().min(10, "Please enter a valid mobile number"),
  AboutUs: z.string().min(10, "Please provide at least 10 characters about yourself"),
})

type RegisterFormData = z.infer<typeof registerSchema>

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [userTypeValue, setUserTypeValue] = useState("")
  const { register: registerUser, isLoading } = useAuth()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    const success = await registerUser(data)
    if (success) {
      toast.success("Registration successful!")
      router.push("/dashboard")
    } else {
      toast.error("Registration failed. Please try again.")
    }
  }

  const formFields = [
    { name: "EmployeeCode", label: "Employee Code", icon: User, type: "text", placeholder: "Enter employee code" },
    {
      name: "OrgCode",
      label: "Organization Code",
      icon: Building,
      type: "text",
      placeholder: "Enter organization code",
    },
    { name: "UserName", label: "Full Name", icon: User, type: "text", placeholder: "Enter your full name" },
    { name: "UserEmail", label: "Email Address", icon: Mail, type: "email", placeholder: "Enter your email" },
    { name: "UserDOB", label: "Date of Birth", icon: Calendar, type: "date", placeholder: "" },
    { name: "LoginId", label: "Login Email", icon: Mail, type: "email", placeholder: "Enter login email" },
    { name: "Mobile", label: "Mobile Number", icon: Phone, type: "tel", placeholder: "Enter mobile number" },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto"
    >
      <Card className="border-border bg-card">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-foreground">Create Account</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Fill in your details to create a new account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formFields.map((field, index) => (
                <motion.div
                  key={field.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  className="space-y-2"
                >
                  <Label htmlFor={field.name} className="text-foreground">
                    {field.label}
                  </Label>
                  <div className="relative">
                    <field.icon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id={field.name}
                      type={field.type}
                      placeholder={field.placeholder}
                      className="pl-10 bg-input border-border text-foreground"
                      {...register(field.name as keyof RegisterFormData)}
                    />
                  </div>
                  {errors[field.name as keyof RegisterFormData] && (
                    <p className="text-sm text-destructive">{errors[field.name as keyof RegisterFormData]?.message}</p>
                  )}
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, duration: 0.3 }}
              className="space-y-2"
            >
              <Label htmlFor="UserType" className="text-foreground">
                User Type
              </Label>
              <Select 
                onValueChange={(value) => {
                  setUserTypeValue(value)
                  setValue("UserType", value)
                }}
                value={userTypeValue}
              >
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
              {errors.UserType && <p className="text-sm text-destructive">{errors.UserType.message}</p>}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.3 }}
              className="space-y-2"
            >
              <Label htmlFor="LoginPwd" className="text-foreground">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="LoginPwd"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  className="pr-10 bg-input border-border text-foreground"
                  {...register("LoginPwd")}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {errors.LoginPwd && <p className="text-sm text-destructive">{errors.LoginPwd.message}</p>}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9, duration: 0.3 }}
              className="space-y-2"
            >
              <Label htmlFor="AboutUs" className="text-foreground">
                About You
              </Label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Textarea
                  id="AboutUs"
                  placeholder="Tell us about yourself..."
                  className="pl-10 bg-input border-border text-foreground min-h-[80px]"
                  {...register("AboutUs")}
                />
              </div>
              {errors.AboutUs && <p className="text-sm text-destructive">{errors.AboutUs.message}</p>}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.3 }}
            >
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={isLoading}
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full"
                  />
                ) : (
                  "Create Account"
                )}
              </Button>
            </motion.div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}