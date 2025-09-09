import { useToast } from "@/hooks/use-toast"
import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/contexts/auth-context"
import { AppWrapper } from "@/components/app-wrapper"
import { Suspense } from "react"
import "./globals.css"

// Import Toaster from your toast library if needed
import { ToastProvider, ToastViewport } from "@/components/ui/toast"

export const metadata: Metadata = {
  title: "Website Management System",
  description: "Professional Website Management Dashboard with Authentication",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={<div>Loading...</div>}>
         <AuthProvider>
  <AppWrapper>
    {children}
    <ToastProvider>
      <ToastViewport />
    </ToastProvider>
  </AppWrapper>
</AuthProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
