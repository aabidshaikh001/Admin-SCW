"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Settings,
  BarChart3,
  User,
  LogOut,
  Menu,
  X,
  Database,
  Shield,
  Palette,
  Files,
  Home,
  Bell,
  Building2,
  FileBadge2,
  Layers,
  FileCog,
  BarChart4,
  ChevronDown,
  ChevronRight,
 FileQuestion,
 Mail
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useState, useMemo } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"

interface DashboardSidebarProps {
  className?: string
}

export function DashboardSidebar({ className }: DashboardSidebarProps) {
  const { user, logout } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<string[]>([])
  const pathname = usePathname()

  // Sidebar items by role
  const sidebarItems = useMemo(() => {
    if (user?.UserType === "SA") {
      return [
        { icon: LayoutDashboard, label: " Dashboard", href: "/sa-dashboard" },
        { icon: Bell, label: "Notifications", href: "/sa-notifications" },
        {
          icon: Building2,
          label: "Organization",
          children: [
            { icon: FileBadge2, label: "Master", href: "/org/info" },
            { icon: FileBadge2, label: "License", href: "/org/license" },
            // { icon: FileBadge2, label: "Financial Year", href: "/org/financial-year" },
            // { icon: FileBadge2, label: "Banks", href: "/org/banks" },
            { icon: FileBadge2, label: "Modules", href: "/org/modules" },
            // { icon: FileBadge2, label: "Prefixes", href: "/org/prefixes" },

          ],
        },
           {
          icon: User,
          label: "User Management",
          children: [
            { icon: User, label: "Users", href: "/users/manage" },
            { icon: User, label: "Modules", href: "/users/modules" },
          ],
        },


        {
          icon: Layers,
          label: "CMS",
          children: [
            { icon: FileCog, label: "Templates", href: "/cms/templates" },
            { icon: FileCog, label: "Components", href: "/cms/components" },
          ],
        },
         
             { icon: FileQuestion, label: "Help", 
              children: [
                { icon: FileQuestion, label: "Documentation", href: "/sa-documentation" },
                { icon: FileQuestion, label: "Tickets", href: "/sa-tickets" }
              ]
              },

        { icon: BarChart4, label: "Reports", href: "/reports" },

        { icon: Settings, label: "Settings", href: "/sa-settings" },
      
      ]
    }

    if (user?.UserType === "Admin") {
      return [
        { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
         
        { icon: Bell, label: "Notifications", href: "/admin-notifications" },
       
           { icon: FileCog, label: "Enquiries", href: "/admin-cms/enquiries" },
          
                {
          icon: Mail,
          label: "NewsLetters",
          children: [
        { icon: FileCog, label: "Subscribers", href: "/admin-nl/subscribers" },
        { icon: Database, label: "Emailer", href: "/admin-nl/templates" },
            { icon: Mail, label: "Mail Sent", href: "/admin-nl/email-sent" },
          ]
        },
              {
          icon: Database,
          label: "Careers",
          children: [
        { icon: Database, label: "Jobs", href: "/admin-careers/jobs" },
        { icon: Database, label: "Applications", href: "/admin-careers/job-applications" },
          ]
        },


{
          icon: BarChart3,
          label: "Blogs",
          children: [
       { icon: BarChart3, label: "Blogs", href: "/admin-blog/blog-manager" },
       { icon: BarChart3, label: "Author", href: "/admin-blog/blog-authors" },
        { icon: BarChart3, label: "Categories", href: "/admin-blog/blog-categories" },


          ]
        },
            { icon: User, label: "User Management", href: "/user-management" },
            {
          icon: Layers,
          label: "KRA",
          children: [
            { icon: FileCog, label: "Key Pointers", href: "/admin-kra/keypointers" },
            { icon: FileCog, label: "Features", href: "/admin-kra/features" },
            { icon: FileCog, label: "Clients", href: "/admin-kra/clients" },
            { icon: FileCog, label: "Industries", href: "/admin-kra/industries" },
            { icon: FileCog, label: "Testimonials", href: "/admin-kra/testimonials" },
            { icon: FileCog, label: "Services", href: "/admin-kra/services" },
            { icon: FileCog, label: "Projects", href: "/admin-kra/projects" },
              { icon: FileCog, label: "Team", href: "/admin-kra/team" },
          ]
        },
         {
          icon: Layers,
          label: "CMS",
          children: [
            { icon: FileCog, label: "Top Header", href: "/admin-cms/topheader" },
            { icon: FileCog, label: "Menu Bar", href: "/admin-cms/menubar" },
            { icon: FileCog, label: "Footer", href: "/admin-cms/footer" },
            { icon: FileCog, label: "Page Header", href: "/admin-cms/page-header" },
             { icon: FileCog, label: "Sections", href: "/admin-cms/sections" },
            { icon: FileCog, label: "Slider", href: "/admin-cms/slider" },          
          ],
        },
           

   {
          icon: Layers,
          label: "Terms",
          children: [
         { icon: FileCog, label: "FAQs", href: "/admin-terms/faqs" },
            { icon: FileCog, label: "Privacy Policy", href: "/admin-terms/privacy-policy" },
            { icon: FileCog, label: "T&C", href: "/admin-terms/terms-of-service" },
            { icon: FileCog, label: "Return & Refund", href: "/admin-terms/return-and-refund" },
            { icon: FileCog, label: "Shipping", href: "/admin-terms/shipping" },
            { icon: FileCog, label: "Payment", href: "/admin-terms/payment" },

          ]
        },
  //  { icon: Palette, label: "Themes", href: "/themes" },
        { icon: Settings, label: "Settings", href: "/settings" },
         { icon: BarChart4, label: "Reports", href: "/admin-reports" },
               { icon: FileQuestion, label: "Help", href: "/admin-help" },

        // { icon: Home, label: "Home", href: "/home-manager" },
        // { icon: Files, label: "About", href: "/about-manager" },
        
       
        // { icon: Shield, label: "Team", href: "/team-manager" },
     
      
  
      ]
    }

    if (user?.UserType === "User") {
      return [
        { icon: LayoutDashboard, label: "Dashboard", href: "/user-dashboard" },
        { icon: Bell, label: "Notifications", href: "/user-notifications" },
           { icon: FileQuestion, label: "Help", href: "/user-help" },

        { icon: BarChart4, label: "Reports", href: "/user-reports" },

        { icon: Settings, label: "Settings", href: "/user-settings" },
      ]
    }

    return []
  }, [user])

  const handleLogout = () => logout()

  const toggleMenu = (label: string) => {
    setExpandedMenus((prev) =>
      prev.includes(label) ? prev.filter((m) => m !== label) : [...prev, label],
    )
  }

  return (
    <motion.div
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "flex flex-col h-full bg-sidebar border-r border-sidebar-border",
        isCollapsed ? "w-16" : "w-64",
        className,
      )}
    >
      {/* Header */}
<div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border bg-gray-800">

  {!isCollapsed ? (
    // Expanded sidebar -> show big logo
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
        className=" p-2 rounded-lg flex items-center justify-center"
    >
      <Image
        src="/logo-sw.png"
        alt="Logo"
        width={120}
        height={40}
        className="object-contain"
        
        priority
      />
    </motion.div>
  ) : (
    // Collapsed sidebar -> logo is clickable to expand
    <button onClick={() => setIsCollapsed(false)}>
      <Image
        src="/logo.png"
        alt="Logo"
        width={40}
        height={40}
        className="object-contain"
        priority
      />
    </button>
  )}

{/* Show Menu toggle only when expanded */}
{!isCollapsed && (
  <Button
    variant="ghost"
    size="sm"
    onClick={() => setIsCollapsed(true)}
    className="text-white hover:bg-sidebar-accent"
  >
    <Menu className="h-4 w-4 text-white" />
  </Button>
)}

</div>


      {/* Navigation - scrollable */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {sidebarItems.map((item, index) => {
          if (item.children) {
            const isOpen = expandedMenus.includes(item.label)

            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.3 }}
              >
                <div className="flex flex-col space-y-1">
                  <Button
                    variant="ghost"
                    onClick={() => toggleMenu(item.label)}
                    className={cn(
                      "w-full justify-between text-sidebar-foreground hover:bg-sidebar-accent",
                      isCollapsed && "justify-center",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.label}</span>}
                    </div>
                    {!isCollapsed &&
                      (isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />)}
                  </Button>

                  {/* Submenu */}
                  {!isCollapsed && isOpen && (
                    <div className="ml-6 flex flex-col space-y-1">
                      {item.children.map((sub) => (
                        <Link key={sub.href} href={sub.href}>
                          <Button
                            variant={pathname === sub.href ? "default" : "ghost"}
                            className={cn(
                              "w-full justify-start gap-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent",
                              pathname === sub.href &&
                                "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90",
                            )}
                          >
                            <sub.icon className="h-3 w-3" />
                            <span>{sub.label}</span>
                          </Button>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )
          }

          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 + 0.3 }}
            >
              <Link href={item.href}>
                <Button
                  variant={pathname === item.href ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent",
                    pathname === item.href &&
                      "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90",
                    isCollapsed && "justify-center",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {!isCollapsed && <span>{item.label}</span>}
                </Button>
              </Link>
            </motion.div>
          )
        })}
      </nav>

            {/* User Section */}
      <div className="p-4 border-t border-sidebar-border space-y-2">
        {user?.UserType === "Admin" && (
          <Link href="/admin-profile">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent",
                isCollapsed && "justify-center",
              )}
            >
              <User className="h-4 w-4" />
              {!isCollapsed && <span>Profile</span>}
            </Button>
          </Link>
        )}

        {user?.UserType === "User" && (
          <Link href="/profile">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent",
                isCollapsed && "justify-center",
              )}
            >
              <User className="h-4 w-4" />
              {!isCollapsed && <span>Profile</span>}
            </Button>
          </Link>
        )}

        {/* SuperAdmin (SA) won't see profile */}

        <Button
          variant="ghost"
          onClick={handleLogout}
          className={cn(
            "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-destructive",
            isCollapsed && "justify-center",
          )}
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && <span>Logout</span>}
        </Button>
      </div>

    </motion.div>
  )
}
