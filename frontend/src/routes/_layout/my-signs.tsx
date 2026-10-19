import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_layout/my-signs")({
  component: MySigns,
  head: () => ({
    meta: [
      {
        title: "My Signs - TİD Coach",
      },
    ],
  }),
})

function MySigns() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Signs</h1>
        <p className="text-muted-foreground">
          The signs you saved and your practice history.
        </p>
      </div>
    </div>
  )
}
