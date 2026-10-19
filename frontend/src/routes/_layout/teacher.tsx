import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_layout/teacher")({
  component: Teacher,
  head: () => ({
    meta: [
      {
        title: "Teacher - TİD Coach",
      },
    ],
  }),
})

function Teacher() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Teacher</h1>
        <p className="text-muted-foreground">
          Pick a sign, watch the reference video, copy it on camera, and see how
          close you were.
        </p>
      </div>
    </div>
  )
}
