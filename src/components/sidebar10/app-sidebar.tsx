import * as React from "react"

// sidebar-1 components (RSS reader nav)
// import { NavFavorites } from "@/components/nav-favorites"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavWorkspaces } from "@/components/nav-workspaces"
import { TeamSwitcher } from "@/components/team-switcher"

// sidebar-8 collapsible platform nav — imported directly, no duplication
import { NavMain as NavPlatform } from "@/components/sidebar8/nav-main"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  Home,
  Sparkles,
  Inbox,
  Settings2,
  MessageCircleQuestion,
  Terminal,
  SquareTerminal,
  Bot,
  BookOpen,
  Clock,
  Heart,
} from "lucide-react"
import type { FolderRow, FeedRow, Selection } from "@/components/Sidebar"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  folders: FolderRow[]
  feeds: FeedRow[]
  articleCounts: Record<string, number>
  totalCount: number
  todayCount: number
  bookmarksCount: number
  readLaterCount: number
  favoritesCount: number
  selection: Selection
  onSelectionChange: (s: Selection) => void
}

// Platform items from sidebar-8 — collapsible groups with chevron expand/collapse
const platformItems = [
  {
    title: "Playground",
    url: "#",
    icon: SquareTerminal,
    isActive: true,
    items: [
      { title: "History", url: "#" },
      { title: "Starred", url: "#" },
      { title: "Settings", url: "#" },
    ],
  },
  {
    title: "Models",
    url: "#",
    icon: Bot,
    items: [
      { title: "Genesis", url: "#" },
      { title: "Explorer", url: "#" },
      { title: "Quantum", url: "#" },
    ],
  },
  {
    title: "Documentation",
    url: "#",
    icon: BookOpen,
    items: [
      { title: "Introduction", url: "#" },
      { title: "Get Started", url: "#" },
      { title: "Tutorials", url: "#" },
      { title: "Changelog", url: "#" },
    ],
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings2,
    items: [
      { title: "General", url: "#" },
      { title: "Team", url: "#" },
      { title: "Billing", url: "#" },
      { title: "Limits", url: "#" },
    ],
  },
]

export function AppSidebar({
  folders,
  feeds,
  articleCounts,
  totalCount,
  todayCount,
  bookmarksCount,
  readLaterCount,
  favoritesCount,
  selection,
  onSelectionChange,
  ...props
}: AppSidebarProps) {
  const teams = [
    {
      name: "RSS Reader",
      logo: <Terminal />,
      plan: "Free",
    },
  ]

  // sidebar-1 flat nav items (All Articles, Today, Bookmarks)
  const navMain = [
    {
      title: "All Articles",
      url: "#",
      icon: <Home />,
      isActive: selection.type === "all",
      onClick: () => onSelectionChange({ type: "all" }),
      badge: totalCount,
    },
    {
      title: "Today",
      url: "#",
      icon: <Sparkles />,
      isActive: selection.type === "today",
      onClick: () => onSelectionChange({ type: "today" }),
      badge: todayCount,
    },
    {
      title: "Bookmarks",
      url: "#",
      icon: <Inbox />,
      isActive: selection.type === "bookmarks",
      onClick: () => onSelectionChange({ type: "bookmarks" }),
      badge: bookmarksCount,
    },
    {
      title: "Read Later",
      url: "#",
      icon: <Clock />,
      isActive: selection.type === "read-later",
      onClick: () => onSelectionChange({ type: "read-later" }),
      badge: readLaterCount,
    },
    {
      title: "Favorites",
      url: "#",
      icon: <Heart />,
      isActive: selection.type === "favorites",
      onClick: () => onSelectionChange({ type: "favorites" }),
      badge: favoritesCount,
    },
  ]

  const navSecondary = [
    {
      title: "Settings",
      url: "#",
      icon: <Settings2 />,
    },
    {
      title: "Help",
      url: "#",
      icon: <MessageCircleQuestion />,
    },
  ]

  const favorites = feeds
    .filter((f) => articleCounts[f.id] > 5)
    .map((f) => ({
      name: f.name,
      url: "#",
      emoji: "📰",
      onClick: () => onSelectionChange({ type: "feed", feedId: f.id, folderId: f.folderId || "" }),
    }))

  const workspaces = folders.map((folder) => ({
    name: folder.name,
    emoji: "📁",
    onClick: () => onSelectionChange({ type: "folder", folderId: folder.id }),
    pages: feeds
      .filter((f) => f.folderId === folder.id)
      .map((f) => ({
        name: f.name,
        emoji: "📄",
        onClick: () => {
          onSelectionChange({ type: "feed", feedId: f.id, folderId: folder.id })
        },
      })),
  }))

  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
        {/* sidebar-1: flat nav — All Articles, Today, Bookmarks */}
        <NavMain items={navMain} />
      </SidebarHeader>
      <SidebarContent>
        {/* sidebar-8 Platform section: collapsible groups with rotating chevron */}
        <NavPlatform items={platformItems} />

        {/* <NavFavorites favorites={favorites} /> */}
        <NavWorkspaces workspaces={workspaces} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
