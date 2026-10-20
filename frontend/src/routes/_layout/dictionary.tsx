import { createFileRoute } from "@tanstack/react-router"
import { Search } from "lucide-react"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import { DataTable } from "@/components/Common/DataTable"
import { useDictionaryColumns } from "@/components/Dictionary/columns"
import { Input } from "@/components/ui/input"
import i18n from "@/i18n"
import { SIGNS, searchSigns } from "@/lib/signs"

export const Route = createFileRoute("/_layout/dictionary")({
  component: Dictionary,
  head: () => ({
    meta: [
      {
        title: i18n.t("titles.dictionary"),
      },
    ],
  }),
})

function EmptyState({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Search className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}

function Dictionary() {
  const { t } = useTranslation()
  const columns = useDictionaryColumns()
  const [query, setQuery] = useState("")
  const results = useMemo(() => searchSigns(SIGNS, query), [query])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {t("nav.dictionary")}
        </h1>
        <p className="text-muted-foreground">{t("dictionary.description")}</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder={t("dictionary.searchPlaceholder")}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {SIGNS.length === 0 ? (
        <EmptyState
          title={t("dictionary.emptyTitle")}
          description={t("dictionary.emptyDescription")}
        />
      ) : results.length === 0 ? (
        <EmptyState
          title={t("dictionary.noResultTitle")}
          description={t("dictionary.noResultDescription")}
        />
      ) : (
        <DataTable columns={columns} data={results} />
      )}
    </div>
  )
}
