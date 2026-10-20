import type { HandLandmarkerResult } from "@mediapipe/tasks-vision"
import { createFileRoute } from "@tanstack/react-router"
import { useCallback, useRef, useState } from "react"
import { useTranslation } from "react-i18next"

import { HandTracker } from "@/components/Translator/HandTracker"
import { SignGuesses } from "@/components/Translator/SignGuesses"
import { VideoUpload } from "@/components/Translator/VideoUpload"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import i18n from "@/i18n"
import {
  type LandmarkFrame,
  predictSignFromLandmarks,
  type SignPrediction,
} from "@/lib/signPrediction"

export const Route = createFileRoute("/_layout/translator")({
  component: Translator,
  head: () => ({
    meta: [
      {
        title: i18n.t("titles.translator"),
      },
    ],
  }),
})

function Translator() {
  const { t } = useTranslation()
  const framesRef = useRef<LandmarkFrame[][]>([])
  const [guesses, setGuesses] = useState<SignPrediction[]>([])
  const [hasTried, setHasTried] = useState(false)

  const handleLandmarks = useCallback((result: HandLandmarkerResult) => {
    const firstHand = result.landmarks[0]
    if (firstHand) {
      framesRef.current.push(firstHand)
    }
  }, [])

  const translate = useCallback(async () => {
    const predictions = await predictSignFromLandmarks(framesRef.current)
    framesRef.current = []
    setGuesses(predictions)
    setHasTried(true)
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {t("nav.translator")}
        </h1>
        <p className="text-muted-foreground">{t("translator.description")}</p>
      </div>

      <Tabs defaultValue="live-camera">
        <TabsList>
          <TabsTrigger value="live-camera">
            {t("translator.liveCamera")}
          </TabsTrigger>
          <TabsTrigger value="upload-video">
            {t("translator.uploadVideo")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="live-camera">
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <div className="flex flex-col gap-4">
              <HandTracker onLandmarks={handleLandmarks} />
              <div>
                <Button onClick={translate}>{t("translator.translate")}</Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{t("translator.bestGuesses")}</CardTitle>
              </CardHeader>
              <CardContent>
                <SignGuesses guesses={guesses} hasTried={hasTried} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="upload-video">
          <VideoUpload />
        </TabsContent>
      </Tabs>
    </div>
  )
}
