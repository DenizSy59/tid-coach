import { Languages } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { LANGUAGES, type Language, setLanguage } from "@/i18n"

export const SidebarLanguage = () => {
  const { isMobile } = useSidebar()
  const { t, i18n } = useTranslation()
  const current = (
    i18n.language in LANGUAGES ? i18n.language : "tr"
  ) as Language

  return (
    <SidebarMenuItem>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            tooltip={t("common.language")}
            data-testid="language-button"
          >
            <Languages className="size-4 text-muted-foreground" />
            <span>{LANGUAGES[current]}</span>
            <span className="sr-only">{t("common.language")}</span>
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side={isMobile ? "top" : "right"}
          align="end"
          className="w-(--radix-dropdown-menu-trigger-width) min-w-56"
        >
          {(Object.keys(LANGUAGES) as Language[]).map((code) => (
            <DropdownMenuItem
              key={code}
              data-testid={`language-${code}`}
              onClick={() => setLanguage(code)}
            >
              {LANGUAGES[code]}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  )
}

export const LanguageToggle = () => {
  const { t, i18n } = useTranslation()
  const current = (
    i18n.language in LANGUAGES ? i18n.language : "tr"
  ) as Language

  return (
    <div className="flex items-center justify-center">
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button data-testid="language-button" variant="outline" size="icon">
            <Languages className="h-[1.2rem] w-[1.2rem]" />
            <span className="sr-only">{t("common.language")}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {(Object.keys(LANGUAGES) as Language[]).map((code) => (
            <DropdownMenuItem
              key={code}
              data-testid={`language-${code}`}
              onClick={() => setLanguage(code)}
            >
              {LANGUAGES[code]}
              {code === current ? " ✓" : ""}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
