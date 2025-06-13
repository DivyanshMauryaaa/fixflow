"use client"

import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export function ClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen">
      <SidebarProvider>
        <AppSidebar />
        <main className="flex-1">
          {children}
        </main>
      </SidebarProvider>
    </div>
  )
}