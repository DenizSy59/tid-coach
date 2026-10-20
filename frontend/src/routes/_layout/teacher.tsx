import type { HandLandmarkerResult } from "@mediapipe/tasks-vision"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { Bookmark } from "lucide-react"
import { useCallback, useRef, useState } from "react"
import { useTranslation } from "react-i18next"

import { PracticeService, SavedSignsService } from "@/client"
import { ReferenceVideo } from "@/components/Teacher/ReferenceVideo"
import { HandTracker } from "@/components/Translator/HandTracker"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import useCustomToast from "@/hooks/useCustomToast"
import i18n from "@/i18n"
import { type LandmarkFrame, scoreAttempt } from "@/lib/signPrediction"
import { SIGNS, signLabel } from "@/lib/signs"
import { handleError } from "@/utils"

interface TeacherSearch {
  sign?: number
}

export const Route = createFileRoute("/_layout/teacher")({
  component: Teacher,
  validateSearch: (search: Record<string, unknown>): TeacherSearch => {
    const sign = Number(search.sign)
    return Number.isInteger(sign) && sign >= 0 && sign <= 225 ? { sign } : {}
  },
  head: () => ({
    meta: [
      {
        title: i18n.t("titles.teacher"),
      },
    ],
  }),
})

function Teacher() {
  const { t } = useTranslation()
  const { sign } = Route.useSearch()
  const [selected, setSelected] = useState<number | null>(sign ?? null)
  const framesRef = useRef<LandmarkFrame[][]>([])
  const [outcome, setOutcome] = useState<{
    score: number
    looksLike: number | null
  } | null>(null)
  const [checked, setChecked] = useState(false)
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()

  const { data: savedSigns } = useQuery({
    queryFn: async () =>
      (
        await SavedSignsService.signsReadSavedSigns({
          query: { skip: 0, limit: 100 },
        })
      ).data,
    queryKey: ["saved-signs"],
  })
  const isSaved =
    selected !== null &&
    (savedSigns?.data ?? []).some((item) => item.sign_id === selected)

  const saveMutation = useMutation({
    mutationFn: (signId: number) =>
      SavedSignsService.signsCreateSavedSign({ body: { sign_id: signId } }),
    onSuccess: () => {
      showSuccessToast(t("mySigns.saved"))
      queryClient.invalidateQueries({ queryKey: ["saved-signs"] })
    },
    onError: handleError.bind(showErrorToast),
  })

  const attemptMutation = useMutation({
    mutationFn: (body: {
      sign_id: number
      score?: number | null
      predicted_sign_id?: number | null
      practised_at?: string | null
    }) => PracticeService.createPracticeAttempt({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["practice-attempts"] })
    },
    onError: handleError.bind(showErrorToast),
  })

  const handleLandmarks = useCallback((result: HandLandmarkerResult) => {
    const firstHand = result.landmarks[0]
    if (firstHand) {
      framesRef.current.push(firstHand)
    }
  }, [])

  const check = useCallback(async () => {
    if (selected === null) {
      return
    }
    const next = await scoreAttempt(selected, framesRef.current)
    framesRef.current = []
    setOutcome(next)
    setChecked(true)
    attemptMutation.mutate({
      sign_id: selected,
      score: next?.score ?? null,
      predicted_sign_id: next?.looksLike ?? null,
      // Sent so an attempt practised offline keeps the time it happened,
      // not the time it finally reaches the server.
      practised_at: new Date().toISOString(),
    })
  }, [selected, attemptMutation])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {t("nav.teacher")}
        </h1>
        <p className="text-muted-foreground">{t("teacher.description")}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {SIGNS.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            {t("teacher.needList")}
          </p>
        ) : (
          <Select
            value={selected === null ? undefined : String(selected)}
            onValueChange={(value) => {
              setSelected(Number(value))
              setChecked(false)
              setOutcome(null)
            }}
          >
            <SelectTrigger className="w-64">
              <SelectValue placeholder={t("teacher.pickSign")} />
            </SelectTrigger>
            <SelectContent>
              {SIGNS.map((item) => (
                <SelectItem key={item.id} value={String(item.id)}>
                  {item.tr}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Button
          variant="outline"
          disabled={selected === null || isSaved || saveMutation.isPending}
          onClick={() => selected !== null && saveMutation.mutate(selected)}
        >
          <Bookmark />
          {isSaved ? t("teacher.savedAlready") : t("teacher.saveSign")}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("teacher.referenceVideo")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ReferenceVideo signId={selected} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("teacher.yourCamera")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <HandTracker onLandmarks={handleLandmarks} />
            <div>
              <Button onClick={check} disabled={selected === null}>
                {t("teacher.checkMySign")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("teacher.yourScore")}</CardTitle>
          </CardHeader>
          <CardContent>
            {!checked ? (
              <p className="text-muted-foreground text-sm">
                {t("teacher.scoreHint")}
              </p>
            ) : outcome === null ? (
              <p className="text-muted-foreground text-sm">
                {t("teacher.noScore")}
              </p>
            ) : (
              <div className="flex flex-col gap-1">
                <span className="text-2xl font-bold">{outcome.score}/100</span>
                <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                  <div
                    className="bg-primary h-full rounded-full"
                    style={{ width: `${outcome.score}%` }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("teacher.looksLike")}</CardTitle>
          </CardHeader>
          <CardContent>
            {!checked || outcome === null ? (
              <p className="text-muted-foreground text-sm">
                {t("teacher.nothingToWarn")}
              </p>
            ) : outcome.looksLike === null ? (
              <p className="text-muted-foreground text-sm">
                {t("teacher.didNotLookLike")}
              </p>
            ) : (
              <p className="text-sm">
                {t("teacher.careful", {
                  sign: signLabel(outcome.looksLike),
                })}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
