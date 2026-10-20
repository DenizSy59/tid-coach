import { useTranslation } from "react-i18next"

import type { SignPrediction } from "@/lib/signPrediction"

interface SignGuessesProps {
  guesses: SignPrediction[]
  hasTried: boolean
}

export function SignGuesses({ guesses, hasTried }: SignGuessesProps) {
  const { t } = useTranslation()
  const top = guesses.slice(0, 3)

  if (!hasTried) {
    return (
      <p className="text-muted-foreground text-sm">
        {t("translator.startHint")}
      </p>
    )
  }

  if (top.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">{t("translator.notSure")}</p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {top.map((guess) => (
        <div key={guess.sign_id} className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">
              {t("translator.signLabel", { id: guess.sign_id })}
            </span>
            <span className="text-muted-foreground">
              {Math.round(guess.confidence * 100)}%
            </span>
          </div>
          <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
            <div
              className="bg-primary h-full rounded-full"
              style={{ width: `${Math.round(guess.confidence * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
