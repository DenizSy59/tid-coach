import {
  Bookmark,
  BookOpen,
  GraduationCap,
  Home,
  Users,
  Video,
} from "lucide-react"
import { useTranslation } from "react-i18next"

import { SidebarAppearance } from "@/components/Common/Appearance"
import { SidebarLanguage } from "@/components/Common/Language"
import { Logo } from "@/components/Common/Logo"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"
import useAuth from "@/hooks/useAuth"
import { type Item, Main } from "./Main"
import { User } from "./User"

export function AppSidebar() {
  const { user: currentUser } = useAuth()
  const { t } = useTranslation()

  const baseItems: Item[] = [
    { icon: Home, title: t("nav.home"), path: "/" },
    { icon: Video, title: t("nav.translator"), path: "/translator" },
    { icon: GraduationCap, title: t("nav.teacher"), path: "/teacher" },
    { icon: BookOpen, title: t("nav.dictionary"), path: "/dictionary" },
    { icon: Bookmark, title: t("nav.mySigns"), path: "/my-signs" },
  ]

  const items = currentUser?.is_superuser
    ? [...baseItems, { icon: Users, title: t("nav.admin"), path: "/admin" }]
    : baseItems

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-4 py-6 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:items-center">
        <Logo variant="responsive" />
      </SidebarHeader>
      <SidebarContent>
        <Main items={items} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarLanguage />
        <SidebarAppearance />
        <User user={currentUser} />
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar
