"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Mail,
  MessageSquare,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  X,
  User,
  Brain,
} from "lucide-react"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar"

interface SidebarLinkProps {
  href: string
  icon: React.ElementType
  label: string
  active?: boolean
}

const SidebarLink = ({ href, icon: Icon, label, active }: SidebarLinkProps) => {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={active}>
        <Link href={href} className="w-full">
          <Icon className="h-5 w-5" />
          <span>{label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

export function AppSidebar() {
  const pathname = usePathname()
  const { isMobile, toggleSidebar } = useSidebar()
  const [open, setOpen] = useState(false)

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/inbox", label: "Inbox Manager", icon: Mail },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/dashboard?tab=settings", label: "Settings", icon: Settings },
    { href: "/dashboard?tab=ai-settings", label: "AI Settings", icon: Brain },
    { href: "/profile", label: "Profile", icon: User },
  ]

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center justify-between">
          <Logo />
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {links.map((link) => (
            <SidebarLink
              key={link.href}
              href={link.href}
              icon={link.icon}
              label={link.label}
              active={pathname === link.href}
            />
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <SidebarMenu>
          <SidebarLink href="/help" icon={HelpCircle} label="Help & Support" />
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => console.log("Logout")}>
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

export function MobileMenuTrigger() {
  const { toggleSidebar } = useSidebar()

  return (
    <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
      <Menu className="h-5 w-5" />
    </Button>
  )
}
