import { createFileRoute, Link as RouterLink } from "@tanstack/react-router"
import { Bookmark, BookOpen, GraduationCap, Video } from "lucide-react"
import { useTranslation } from "react-i18next"

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import useAuth from "@/hooks/useAuth"
import i18n from "@/i18n"

const sections = [
  { icon: Video, key: "translator", path: "/translator" },
  { icon: GraduationCap, key: "teacher", path: "/teacher" },
  { icon: BookOpen, key: "dictionary", path: "/dictionary" },
  { icon: Bookmark, key: "mySigns", path: "/my-signs" },
] as const

export const Route = createFileRoute("/_layout/")({
  component: Home,
  head: () => ({
    meta: [
      {
        title: i18n.t("titles.home"),
      },
    ],
  }),
})

function Home() {
  const { user: currentUser } = useAuth()
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl truncate max-w-sm">
          {t("home.greeting", {
            name: currentUser?.full_name || currentUser?.email || "",
          })}
        </h1>
        <p className="text-muted-foreground">{t("home.welcome")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {sections.map((section) => (
          <RouterLink key={section.key} to={section.path}>
            <Card className="h-full transition-colors hover:bg-accent">
              <CardHeader>
                <section.icon className="h-5 w-5 text-muted-foreground" />
                <CardTitle>{t(`nav.${section.key}`)}</CardTitle>
                <CardDescription>{t(`home.${section.key}`)}</CardDescription>
              </CardHeader>
            </Card>
          </RouterLink>
        ))}
      </div>
    </div>
  )
}
