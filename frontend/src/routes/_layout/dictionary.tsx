import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_layout/dictionary")({
  component: Dictionary,
  head: () => ({
    meta: [
      {
        title: "Dictionary - TİD Coach",
      },
    ],
  }),
})

function Dictionary() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dictionary</h1>
        <p className="text-muted-foreground">
          Search every sign and open it in Teacher to practise.
        </p>
      </div>
    </div>
  )
}
