"use client"

import * as React from "react"
import {
  BookOpen,
  Bot,
  Folder,
  LayoutDashboard,
  Settings2,
} from "lucide-react"
import { SignedIn, SignedOut, useUser } from "@clerk/nextjs"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Collapsible } from "./ui/collapsible"
import { ThemeToggle } from "./theme-toggle"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, isLoaded } = useUser();

  // Add loading state
  if (!isLoaded) {
    return <div>Loading...</div>
  }

  // Make sure to extract only the properties you need
  const userData = {
    name: user?.firstName || "Guest",
    email: user?.primaryEmailAddress?.emailAddress || "",
    avatar: user?.imageUrl || ""
  }

  const data = {
    user: {
      name: userData.name,
      email: userData.email,
      avatar: userData.avatar,
    },
    navMain: [
      {
        title: "Dashboard",
        url: "/",
        icon: LayoutDashboard,
        isActive: true,
        items: [
          {
            title: "Dashboard",
            url: "/",
          },
          {
            title: "Projects",
            url: "/projects",
          },
          {
            title: "Repos",
            url: "/repo",
          },
          {
            title: "Snippets",
            url: "/snippets",
          },
        ],
      },
      {
        title: "Projects",
        url: "/projects",
        isActive: true,
        icon: Folder,
        items: [
          {
            title: "All Projects",
            url: '/projects'
          },
          {
            title: "New Project",
            url: "projects/new",
          },
          {
            title: "Starred",
            url: "projects/starred",
          }
        ],
      },
      {
        title: "Documentation",
        url: "/docs",
        isActive: true,
        icon: BookOpen,
        items: [
          {
            title: "All Documents",
            url: '/docs'
          },
          {
            title: "Auto Generated Docs",
            url: "/docs/auto-gen",
          },
          {
            title: "Mannual Notes",
            url: "/docs/mannual",
          },
        ],
      },
      {
        title: "Snippets & Memory",
        url: "/snippets",
        isActive: true,
        icon: Settings2,
        items: [
          {
            title: "All Snippets",
            url: "/snippets",
          },
          // {
          //   title: "Reusable Code",
          //   url: "/snippets/reusable",
          // },
          {
            title: "Templates",
            url: "/snippets/templates",
          },
          {
            title: "Commands & Scripts",
            url: "/snippets/scripts",
          },
          {
            title: "Pinned",
            url: "/snippets/pinned",
          }
        ],
      },
      {
        title: "Artificial Intelliegence",
        url: "/ai",
        isActive: true,
        icon: Bot,
        items: [
          {
            title: "Ask",
            url: "/ai",
          },
          {
            title: "AI Suggestions",
            url: "/ai/suggestions",
          },
        ],
      },
    ],
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SignedIn>
        <SidebarHeader>
          <div className="flex justify-between">
            <p className="text-3xl font-bold">Fix<span className="text-blue-700">Flow</span></p>
            <ThemeToggle />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <NavMain items={data.navMain} />
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={data.user} />
        </SidebarFooter>
        <SidebarRail />
      </SignedIn>
      <SignedOut>
        <SidebarContent>
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Please sign in to access the sidebar.</p>
          </div>
        </SidebarContent>
      </SignedOut>
    </Sidebar>
  )
}