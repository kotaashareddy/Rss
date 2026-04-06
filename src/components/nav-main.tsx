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
    href?: string
    url?: string
    icon: React.ReactNode
    badge?: React.ReactNode
    exact?: boolean
    isActive?: boolean
    onClick?: () => void
  }[]
}) {
  const routerState = useRouterState()
  const pathname = routerState.location.pathname

  return (
    <SidebarMenu>
      {items.map((item) => {
        const linkHref = item.href || item.url || "#"
        const isActive = item.isActive !== undefined 
          ? item.isActive 
          : (item.exact
            ? pathname === linkHref
            : pathname.startsWith(linkHref))
            
        return (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              isActive={isActive}
              tooltip={item.title}
              onClick={item.onClick}
              render={
                item.href || item.url ? (
                  <Link to={linkHref as any}>
                    {item.icon}
                    <span>{item.title}</span>
                    {item.badge && (
                      <div className="ml-auto text-[10px] font-medium text-muted-foreground group-data-[collapsible=icon]:hidden">
                        {item.badge}
                      </div>
                    )}
                  </Link>
                ) : (
                  <button onClick={item.onClick}>
                    {item.icon}
                    <span>{item.title}</span>
                    {item.badge && (
                      <div className="ml-auto text-[10px] font-medium text-muted-foreground group-data-[collapsible=icon]:hidden">
                        {item.badge}
                      </div>
                    )}
                  </button>
                )
              }
            />
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}
