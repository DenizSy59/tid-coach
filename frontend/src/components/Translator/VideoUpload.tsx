import { useMutation } from "@tanstack/react-query"
import { useRef, useState } from "react"
import { useTranslation } from "react-i18next"

import { TranslateService } from "@/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { SignPrediction } from "@/lib/signPrediction"
import { SignGuesses } from "./SignGuesses"

// Kept in step with MAX_UPLOAD_BYTES on the server. The server decides; this
// only saves the user a pointless upload.
const MAX_BYTES = 20 * 1024 * 1024

export function VideoUpload() {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [guesses, setGuesses] = useState<SignPrediction[]>([])
  const [hasTried, setHasTried] = useState(false)

  const mutation = useMutation({
    mutationFn: async (video: File) =>
      (await TranslateService.translateVideo({ body: { file: video } })).data,
    onSuccess: (result) => {
      setGuesses(result?.data ?? [])
      setHasTried(true)
      setError(null)
    },
    onError: () => setError(t("translator.uploadFailed")),
  })

  const handlePick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const picked = event.target.files?.[0] ?? null
    setError(null)
    setHasTried(false)
    setGuesses([])

    if (picked && picked.size > MAX_BYTES) {
      setError(t("translator.tooLarge"))
      setFile(null)
      return
    }
    setFile(picked)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <div className="flex flex-col gap-4">
        <p className="text-muted-foreground text-sm">
          {t("translator.videoHint")}
        </p>

        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/webm"
          className="hidden"
          onChange={handlePick}
        />

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" onClick={() => inputRef.current?.click()}>
            {t("translator.chooseVideo")}
          </Button>
          <span className="text-muted-foreground text-sm">
            {file ? file.name : t("translator.noFileChosen")}
          </span>
        </div>

        <div>
          <Button
            disabled={!file || mutation.isPending}
            onClick={() => file && mutation.mutate(file)}
          >
            {mutation.isPending
              ? t("translator.uploading")
              : t("translator.uploadAndTranslate")}
          </Button>
        </div>

        {error && <p className="text-destructive text-sm">{error}</p>}
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
  )
}
