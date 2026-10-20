import { Link as RouterLink } from "@tanstack/react-router"
import type { ColumnDef } from "@tanstack/react-table"
import { useTranslation } from "react-i18next"

import type { DataTableFeatures } from "@/components/Common/DataTable"
import { Button } from "@/components/ui/button"
import i18n from "@/i18n"
import type { Sign } from "@/lib/signs"

export function useDictionaryColumns(): ColumnDef<DataTableFeatures, Sign>[] {
  const { t } = useTranslation()

  return [
    {
      accessorKey: "id",
      header: t("dictionary.columnId"),
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.original.id}
        </span>
      ),
    },
    {
      accessorKey: "tr",
      header: t("dictionary.columnTurkish"),
      cell: ({ row }) => <span className="font-medium">{row.original.tr}</span>,
    },
    {
      accessorKey: "en",
      header: t("dictionary.columnEnglish"),
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.en}</span>
      ),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">{i18n.t("common.actions")}</span>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" asChild>
            <RouterLink to="/teacher" search={{ sign: row.original.id }}>
              {t("dictionary.practice")}
            </RouterLink>
          </Button>
        </div>
      ),
    },
  ]
}
