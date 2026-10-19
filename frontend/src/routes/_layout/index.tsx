import { createFileRoute, Link as RouterLink } from "@tanstack/react-router"
import { Bookmark, BookOpen, GraduationCap, Video } from "lucide-react"

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import useAuth from "@/hooks/useAuth"

const sections = [
  {
    icon: Video,
    title: "Translator",
    description:
      "Sign a word on camera or upload a short video, and see the Turkish word.",
    path: "/translator",
  },
  {
    icon: GraduationCap,
    title: "Teacher",
    description:
      "Watch a reference video, copy the sign, and see how close you were.",
    path: "/teacher",
  },
  {
    icon: BookOpen,
    title: "Dictionary",
    description: "Search every sign and open it in Teacher to practise.",
    path: "/dictionary",
  },
  {
    icon: Bookmark,
    title: "My Signs",
    description: "The signs you saved and your practice history.",
    path: "/my-signs",
  },
]

export const Route = createFileRoute("/_layout/")({
  component: Home,
  head: () => ({
    meta: [
      {
        title: "Home - TİD Coach",
      },
    ],
  }),
})

function Home() {
  const { user: currentUser } = useAuth()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl truncate max-w-sm">
          Hi, {currentUser?.full_name || currentUser?.email} 👋
        </h1>
        <p className="text-muted-foreground">
          Welcome back, nice to see you again!!!
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {sections.map((section) => (
          <RouterLink key={section.title} to={section.path}>
            <Card className="h-full transition-colors hover:bg-accent">
              <CardHeader>
                <section.icon className="h-5 w-5 text-muted-foreground" />
                <CardTitle>{section.title}</CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
            </Card>
          </RouterLink>
        ))}
      </div>
    </div>
  )
}
