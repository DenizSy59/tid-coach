import { Link } from "@tanstack/react-router"
import { Hand } from "lucide-react"

import { cn } from "@/lib/utils"

const NAME = "TİD Coach"

interface LogoProps {
  variant?: "full" | "icon" | "responsive"
  className?: string
  asLink?: boolean
}

export function Logo({
  variant = "full",
  className,
  asLink = true,
}: LogoProps) {
  const mark = <Hand className="size-[1.15em] shrink-0 text-primary" />

  const wordmark = (
    <span className="flex items-center gap-2 font-semibold tracking-tight">
      {mark}
      <span>{NAME}</span>
    </span>
  )

  const content =
    variant === "responsive" ? (
      <>
        <span
          className={cn(
            "group-data-[collapsible=icon]:hidden text-base",
            className,
          )}
        >
          {wordmark}
        </span>
        <span
          className={cn(
            "hidden group-data-[collapsible=icon]:block",
            className,
          )}
        >
          {mark}
          <span className="sr-only">{NAME}</span>
        </span>
      </>
    ) : variant === "full" ? (
      <span className={cn("text-base", className)}>{wordmark}</span>
    ) : (
      <span className={className}>
        {mark}
        <span className="sr-only">{NAME}</span>
      </span>
    )

  if (!asLink) {
    return content
  }

  return <Link to="/">{content}</Link>
}
