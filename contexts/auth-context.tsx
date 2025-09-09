"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { apiService } from "@/lib/api"
import { toast } from "sonner"

interface User {
  UserId: number
  EmployeeCode: string
  OrgCode: number
  UserName: string
  UserEmail: string
  UserDOB: string
  UserPhoto?: string
  UserType: string
  LoginId: string
  Mobile: string
  AboutUs: string
  Status: string
  TransDate: string
  
  TransBy: string
  TranDateUpdate?: string
  TranByUpdate?: string
  TranDateDel?: string
  TranByDel?: string
}
interface LoginResponse {
  user?: User
  token?: string
  role?: "SuperAdmin" | "OrgAdmin" | "User"  // 👈 add role here
}


interface AuthContextType {
  user: User | null
  login: (loginId: string, password: string) => Promise<boolean>
  register: (userData: RegisterData) => Promise<boolean>
  logout: () => void
  updateProfile: (userData: Partial<RegisterData>) => Promise<boolean>
  isLoading: boolean
  
}

interface RegisterData {
  EmployeeCode: string
  OrgCode: string
  UserName: string
  UserEmail: string
  UserDOB: string
  UserType: string
  LoginId: string
  LoginPwd: string
  Mobile: string
  AboutUs: string
  UserPhoto?: File
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session on mount
    const checkAuth = async () => {
      const token = localStorage.getItem("token")
      if (token) {
        try {
          const userProfile = await apiService.getProfile()
          setUser(userProfile)
        } catch (error) {
          console.error("Failed to fetch user profile:", error)
          localStorage.removeItem("token")
        }
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  // contexts/auth-context.tsx - Update the login function
// contexts/auth-context.tsx - Improve error handling
const login = async (loginId: string, password: string): Promise<boolean> => {
  setIsLoading(true)
  try {
    console.log("Attempting login with:", { loginId })

    const response: LoginResponse = await apiService.login({
      LoginId: loginId,
      LoginPwd: password,
    })

    if (response.user && response.token) {
      // Ensure UserType is set consistently
      const userWithType: User = {
        ...response.user,
        UserType:
          response.role === "SuperAdmin"
            ? "SA"
            : response.role === "OrgAdmin"
            ? "Admin"
            : "User",
      }

      setUser(userWithType)
      localStorage.setItem("token", response.token)
      toast.success("Login successful!")
      return true
    }

    return false
  } catch (error: any) {
    console.error("Login failed:", error)
    const errorMessage =
      error.response?.data?.message || error.message || "Login failed. Please try again."
    toast.error(errorMessage)
    return false
  } finally {
    setIsLoading(false)
  }
};

  const register = async (userData: RegisterData): Promise<boolean> => {
    setIsLoading(true)
    try {
      const response = await apiService.register(userData)

      if (response.user && response.token) {
        setUser(response.user)
        localStorage.setItem("token", response.token)
        return true
      }
      return false
    } catch (error) {
      console.error("Registration failed:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const updateProfile = async (userData: Partial<RegisterData>): Promise<boolean> => {
    setIsLoading(true)
    try {
      const response = await apiService.updateProfile(userData)

      if (response.user) {
        setUser(response.user)
        return true
      }
      return false
    } catch (error) {
      console.error("Profile update failed:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("token")
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
