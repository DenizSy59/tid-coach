import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import i18n from "@/i18n"

const PendingItems = () => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>{i18n.t("items.id")}</TableHead>
        <TableHead>{i18n.t("items.itemTitle")}</TableHead>
        <TableHead>{i18n.t("items.description")}</TableHead>
        <TableHead>
          <span className="sr-only">{i18n.t("common.actions")}</span>
        </TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {Array.from({ length: 5 }).map((_, index) => (
        <TableRow key={index}>
          <TableCell>
            <Skeleton className="h-4 w-64 font-mono" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-32" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-48" />
          </TableCell>
          <TableCell>
            <div className="flex justify-end">
              <Skeleton className="size-8 rounded-md" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
)

export default PendingItems
