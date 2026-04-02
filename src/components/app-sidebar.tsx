import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavFolders } from "@/components/nav-folders"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CompassIcon, Sun, Heart, TerminalIcon } from "lucide-react"
import type { FolderRow, FeedRow } from "@/components/Sidebar"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  folders: FolderRow[]
  feeds: FeedRow[]
  articleCounts: Record<string, number>
  totalCount: number
  todayCount: number
  favoritesCount: number
  onFolderCreated: () => void
}

export function AppSidebar({
  folders,
  feeds,
  articleCounts,
  totalCount,
  todayCount,
  favoritesCount,
  onFolderCreated,
  ...props
}: AppSidebarProps) {
  const teams = [
    {
      name: "RSS Reader",
      logo: <TerminalIcon />,
      plan: "Free",
    },
  ]

  const navMain = [
    {
      title: "Explore",
      href: "/",
      icon: <CompassIcon />,
      badge: totalCount > 0 ? totalCount : undefined,
      exact: true,
    },
    {
      title: "Today",
      href: "/today",
      icon: <Sun />,
      badge: todayCount > 0 ? todayCount : undefined,
      exact: true,
    },
    {
      title: "Favorites",
      href: "/favorites",
      icon: <Heart />,
      badge: favoritesCount > 0 ? favoritesCount : undefined,
      exact: true,
    },
  ]

  return (
    <Sidebar collapsible="icon" className="border-r" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavFolders
          folders={folders}
          feeds={feeds}
          articleCounts={articleCounts}
          onFolderCreated={onFolderCreated}
        />
      </SidebarContent>
      <SidebarFooter className="p-4 group-data-[collapsible=icon]:hidden">
        <div className="flex flex-col gap-4 rounded-xl border bg-background p-4 shadow-sm dark:border-zinc-800">
          <div className="flex flex-col gap-1.5">
            <h4 className="text-[13px] font-semibold text-foreground">Get Weekly Digest</h4>
            <p className="text-xs text-muted-foreground leading-snug">
              Subscribe to receive a curated weekly roundup of your favorite RSS feeds.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Input
              type="email"
              placeholder="Email"
              className="h-8 bg-background text-xs placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-zinc-400"
            />
            <Button className="h-8 w-full bg-zinc-900 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
              Subscribe
            </Button>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
