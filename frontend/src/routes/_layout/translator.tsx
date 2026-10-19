import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_layout/translator")({
  component: Translator,
  head: () => ({
    meta: [
      {
        title: "Translator - TİD Coach",
      },
    ],
  }),
})

function Translator() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Translator</h1>
        <p className="text-muted-foreground">
          Sign a word in front of your camera, or upload a short video, and see
          the Turkish word.
        </p>
      </div>
    </div>
  )
}
