"use client"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { ChevronRight, Plus, MoreHorizontal } from "lucide-react"

export function NavWorkspaces({
  workspaces,
}: {
  workspaces: {
    name: string
    emoji: React.ReactNode
    onClick?: () => void
    pages: {
      name: string
      emoji: React.ReactNode
      onClick?: () => void
    }[]
  }[]
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Workspaces</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {workspaces.map((workspace) => (
            <Collapsible key={workspace.name}>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={workspace.onClick}>
                  <span>{workspace.emoji}</span>
                  <span>{workspace.name}</span>
                </SidebarMenuButton>
                <SidebarMenuAction
                  render={<CollapsibleTrigger />}
                  className="left-2 bg-sidebar-accent text-sidebar-accent-foreground data-open:rotate-90"
                  showOnHover
                >
                  <ChevronRight
                  />
                </SidebarMenuAction>
                <SidebarMenuAction showOnHover>
                  <Plus
                  />
                </SidebarMenuAction>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {workspace.pages.map((page) => (
                      <SidebarMenuSubItem key={page.name}>
                        <SidebarMenuSubButton onClick={page.onClick}>
                          <span>{page.emoji}</span>
                          <span>{page.name}</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ))}
          <SidebarMenuItem>
            <SidebarMenuButton className="text-sidebar-foreground/70">
              <MoreHorizontal
              />
              <span>More</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
