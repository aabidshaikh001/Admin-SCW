// contexts/auth-context.tsx
"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { apiService } from "@/lib/api"
import {toast} from "react-toastify"

interface User {
  id?: string | number  // original id from backend, can be string or number
  UserId?: number
  EmployeeCode?: string
  OrgCode: number
  UserName: string
  UserEmail: string
  UserDOB?: string
  UserPhoto?: string
  UserType: string   // "SA" | "Admin" | "User"
  LoginId?: string
  Mobile?: string
  AboutUs?: string
  Status?: string
  TransDate?: string
  TransBy?: string
  TranDateUpdate?: string
  TranByUpdate?: string
  TranDateDel?: string
  TranByDel?: string
}

interface OrgProfile {
  OrgID: number
  OrgCode: number
  OrgType: string
  OrgName: string
  ContactPerson: string
  Web: string
  Logo?: string
  Favicon?: string
  Email: string
  Status: string
}

interface LoginResponse {
  user?: User
  token?: string
  role?: "SuperAdmin" | "OrgAdmin" | "User"
  orgCode?: number
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

  // 🔑 LOGIN FUNCTION
  const login = async (loginId: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      const response: LoginResponse = await apiService.login({
        LoginId: loginId,
        LoginPwd: password,
      })

      if (response.token) {
        let loggedInUser: User | null = null

        if (response.role === "OrgAdmin" && response.orgCode) {
          // 👉 Fetch Org Profile for Admins
          const orgProfile: OrgProfile = await apiService.getOrgProfile(response.orgCode)

          loggedInUser = {
            UserId: orgProfile.OrgID,
            OrgCode: orgProfile.OrgCode,
            UserName: orgProfile.OrgName,
            UserEmail: orgProfile.Email,
            UserType: "Admin",
            UserPhoto: orgProfile.Logo,
            Status: orgProfile.Status,
          }
        } else if (response.user) {
          // Normal User / SuperAdmin
          loggedInUser = {
            ...response.user,
            UserId: Number(response.user.id), // convert to number
            UserType:
              response.role === "SuperAdmin"
                ? "SA"
                : response.role === "OrgAdmin"
                ? "Admin"
                : "User",
          }
        }

        if (loggedInUser) {
          setUser(loggedInUser)
          localStorage.setItem("token", response.token)
          toast.success("Login successful!")
          return true
        }
      }

      return false
    } catch (error: any) {
      console.error("Login failed:", error)
      toast.error(error.response?.data?.message || "Login failed. Please try again.")
      return false
    } finally {
      setIsLoading(false)
    }
  }

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
