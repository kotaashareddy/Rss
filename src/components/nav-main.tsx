"use client"

import { Link, useRouterState } from "@tanstack/react-router"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    href: string
    icon: React.ReactNode
    badge?: React.ReactNode
    exact?: boolean
  }[]
}) {
  const routerState = useRouterState()
  const pathname = routerState.location.pathname

  return (
    <SidebarMenu>
      {items.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href)
        return (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              isActive={isActive}
              tooltip={item.title}
              render={
                <Link to={item.href as any}>
                  {item.icon}
                  <span>{item.title}</span>
                  {item.badge && (
                    <div className="ml-auto text-[10px] font-medium text-muted-foreground group-data-[collapsible=icon]:hidden">
                      {item.badge}
                    </div>
                  )}
                </Link>
              }
            />
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}
