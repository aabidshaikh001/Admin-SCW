"use client"

import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Settings } from "lucide-react"

const settingsData = [
  {
    title: "Location",
    links: [
      { name: "Country", href: "/sa-settings/country" },
      { name: "State", href: "/sa-settings/state" },
      { name: "City", href: "/sa-settings/city" },
      { name: "Area", href: "/sa-settings/area" },
    ],
    bgColor: "bg-purple-100",
  },
  {
    title: "Finance",
    links: [
      { name: "Bank", href: "/sa-settings/bank" },
    ],
    bgColor: "bg-teal-100",
  },
  {
    title: "General",
    links: [
      { name: "Subs. Type", href: "/sa-settings/subs-type" },
      { name: "Org Type", href: "/sa-settings/org-type" },
      { name: "User Type", href: "/sa-settings/user-type" },
    ],
    bgColor: "bg-yellow-100",
  },
  {
    title: "Organization",
    links: [
    
      { name: "Financial Year", href: "/sa-settings/financial-year" },
      { name: "Org Config", href: "/sa-settings/email-config", className: "text-red-600" },
    ],
    bgColor: "bg-purple-200",
  },
]

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold flex items-center"><Settings/>Settings</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {settingsData.map((section) => (
            <div key={section.title} className={`p-6 rounded-lg ${section.bgColor}`}>
              <h2 className="font-semibold mb-4">{section.title}</h2>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className={`text-blue-600 hover:underline flex items-center ${link.className || ""}`}
                    >
                       <span className="mr-1">→</span>{link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
