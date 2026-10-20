import { Video } from "lucide-react"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import { signLabel } from "@/lib/signs"

/** Where the AUTSL clip for a sign is expected: frontend/public/videos/<id>.mp4 */
export function signVideoUrl(signId: number): string {
  return `/videos/${signId}.mp4`
}

interface ReferenceVideoProps {
  signId: number | null
}

function Placeholder({ message }: { message: string }) {
  return (
    <div className="flex aspect-video flex-col items-center justify-center gap-2 rounded-xl border bg-muted text-center">
      <Video className="size-8 text-muted-foreground" />
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  )
}

export function ReferenceVideo({ signId }: ReferenceVideoProps) {
  const { t } = useTranslation()
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    setMissing(false)
  }, [])

  if (signId === null) {
    return <Placeholder message={t("teacher.pickToSeeVideo")} />
  }

  if (missing) {
    return <Placeholder message={t("teacher.videoNotAdded")} />
  }

  return (
    // The AUTSL clips have no sound, so there is no speech to caption.
    // The word itself is shown as text next to the video and in aria-label.
    // biome-ignore lint/a11y/useMediaCaption: silent sign-language clip, no audio track
    <video
      key={signId}
      className="aspect-video w-full rounded-xl border bg-muted"
      src={signVideoUrl(signId)}
      aria-label={t("teacher.referenceVideoLabel", { sign: signLabel(signId) })}
      controls
      loop
      playsInline
      onError={() => setMissing(true)}
    />
  )
}
