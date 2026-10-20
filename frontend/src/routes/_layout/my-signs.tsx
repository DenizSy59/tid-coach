import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query"
import { createFileRoute, Link as RouterLink } from "@tanstack/react-router"
import { Bookmark, History, Trash2, TrendingUp } from "lucide-react"
import { Suspense } from "react"
import { useTranslation } from "react-i18next"

import { PracticeService, SavedSignsService } from "@/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import useCustomToast from "@/hooks/useCustomToast"
import i18n from "@/i18n"
import { signLabel } from "@/lib/signs"
import { handleError } from "@/utils"

export const Route = createFileRoute("/_layout/my-signs")({
  component: MySigns,
  head: () => ({
    meta: [
      {
        title: i18n.t("titles.mySigns"),
      },
    ],
  }),
})

function getSavedSignsQueryOptions() {
  return {
    queryFn: async () =>
      (
        await SavedSignsService.signsReadSavedSigns({
          query: { skip: 0, limit: 100 },
        })
      ).data,
    queryKey: ["saved-signs"],
  }
}

function getProgressQueryOptions() {
  return {
    queryFn: async () => (await PracticeService.readProgress()).data,
    queryKey: ["practice-progress"],
  }
}

function getAttemptsQueryOptions() {
  return {
    queryFn: async () =>
      (
        await PracticeService.readPracticeAttempts({
          query: { skip: 0, limit: 100 },
        })
      ).data,
    queryKey: ["practice-attempts"],
  }
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Bookmark
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}

function PendingRows() {
  return (
    <div className="flex flex-col gap-2 py-4">
      {[0, 1, 2].map((row) => (
        <Skeleton key={row} className="h-8 w-full" />
      ))}
    </div>
  )
}

function SavedSignsList() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const { data: savedSigns } = useSuspenseQuery(getSavedSignsQueryOptions())

  const removeMutation = useMutation({
    mutationFn: (signId: number) =>
      SavedSignsService.signsDeleteSavedSign({ path: { sign_id: signId } }),
    onSuccess: () => {
      showSuccessToast(t("mySigns.removed"))
      queryClient.invalidateQueries({ queryKey: ["saved-signs"] })
    },
    onError: handleError.bind(showErrorToast),
  })

  if (!savedSigns || savedSigns.data.length === 0) {
    return (
      <EmptyState
        icon={Bookmark}
        title={t("mySigns.savedEmptyTitle")}
        description={t("mySigns.savedEmptyDescription")}
      />
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("mySigns.sign")}</TableHead>
          <TableHead>
            <span className="sr-only">{t("mySigns.remove")}</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {savedSigns.data.map((savedSign) => (
          <TableRow key={savedSign.id}>
            <TableCell className="font-medium">
              {signLabel(savedSign.sign_id)}
            </TableCell>
            <TableCell>
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" asChild>
                  <RouterLink
                    to="/teacher"
                    search={{ sign: savedSign.sign_id }}
                  >
                    {t("dictionary.practice")}
                  </RouterLink>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={removeMutation.isPending}
                  onClick={() => removeMutation.mutate(savedSign.sign_id)}
                >
                  <Trash2 className="size-4" />
                  <span className="sr-only">{t("mySigns.remove")}</span>
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function PracticeHistory() {
  const { t } = useTranslation()
  const { data: attempts } = useSuspenseQuery(getAttemptsQueryOptions())

  if (!attempts || attempts.data.length === 0) {
    return (
      <EmptyState
        icon={History}
        title={t("mySigns.historyEmptyTitle")}
        description={t("mySigns.historyEmptyDescription")}
      />
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("mySigns.sign")}</TableHead>
          <TableHead>{t("mySigns.score")}</TableHead>
          <TableHead>{t("mySigns.guessed")}</TableHead>
          <TableHead>{t("mySigns.date")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {attempts.data.map((attempt) => (
          <TableRow key={attempt.id}>
            <TableCell className="font-medium">
              {signLabel(attempt.sign_id)}
            </TableCell>
            <TableCell>
              {attempt.score === null || attempt.score === undefined
                ? t("mySigns.noValue")
                : `${Math.round(attempt.score)}/100`}
            </TableCell>
            <TableCell>
              {attempt.predicted_sign_id === null ||
              attempt.predicted_sign_id === undefined
                ? t("mySigns.noValue")
                : signLabel(attempt.predicted_sign_id)}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {attempt.created_at
                ? new Date(attempt.created_at).toLocaleString(i18n.language)
                : t("mySigns.noValue")}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function ProgressSummary() {
  const { t } = useTranslation()
  const { data: progress } = useSuspenseQuery(getProgressQueryOptions())

  if (!progress || progress.data.length === 0) {
    return (
      <EmptyState
        icon={TrendingUp}
        title={t("mySigns.progressEmptyTitle")}
        description={t("mySigns.progressEmptyDescription")}
      />
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("mySigns.sign")}</TableHead>
          <TableHead>{t("mySigns.timesPractised")}</TableHead>
          <TableHead>{t("mySigns.bestScore")}</TableHead>
          <TableHead>{t("mySigns.lastPractised")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {progress.data.map((row) => (
          <TableRow key={row.sign_id}>
            <TableCell className="font-medium">
              {signLabel(row.sign_id)}
            </TableCell>
            <TableCell>{row.times_practised}</TableCell>
            <TableCell>
              {row.best_score === null || row.best_score === undefined
                ? t("mySigns.noValue")
                : `${Math.round(row.best_score)}/100`}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {row.last_practised
                ? new Date(row.last_practised).toLocaleString(i18n.language)
                : t("mySigns.noValue")}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function MySigns() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {t("nav.mySigns")}
        </h1>
        <p className="text-muted-foreground">{t("mySigns.description")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("mySigns.savedSigns")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<PendingRows />}>
            <SavedSignsList />
          </Suspense>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("mySigns.progress")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<PendingRows />}>
            <ProgressSummary />
          </Suspense>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("mySigns.history")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<PendingRows />}>
            <PracticeHistory />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
