"use client"

import * as React from "react"
import { Search, CheckCircle, AlertCircle, Loader2, ChevronRight } from "lucide-react"
import { TOOL_DEFINITIONS } from "@/lib/tool-definitions"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import type { ToolInvocationPart } from "@/lib/types"

function computeInitialOpen(part: ToolInvocationPart): boolean {
  if (part.state === "output-error") return true
  if (part.state === "input-streaming" || part.state === "input-available") {
    return true
  }
  if (part.state === "output-available") {
    const r = part.output as Record<string, unknown> | undefined
    if (r && "error" in r) return true
    return false
  }
  return true
}

function ToolInvocation({ part }: { part: ToolInvocationPart }) {
  const toolDef = TOOL_DEFINITIONS[part.toolName]
  const IconComponent = toolDef?.icon || Search
  const icon = <IconComponent className="h-4 w-4 shrink-0" aria-hidden />
  const displayName = toolDef?.displayName || part.toolName
  const isLoading =
    part.state === "input-streaming" || part.state === "input-available"
  const hasResult = part.state === "output-available"
  const hasError = part.state === "output-error"
  const result = part.output as Record<string, unknown> | undefined
  const resultHasError = Boolean(result && "error" in result)

  const [open, setOpen] = React.useState(() => computeInitialOpen(part))
  const wasLoadingRef = React.useRef(isLoading)

  React.useEffect(() => {
    if (wasLoadingRef.current && !isLoading) {
      if (hasResult && !hasError && !resultHasError) {
        setOpen(false)
      } else if (hasError || resultHasError) {
        setOpen(true)
      }
    }
    wasLoadingRef.current = isLoading
  }, [isLoading, hasResult, hasError, resultHasError])

  const statusIcon = isLoading ? (
    <Loader2
      className="ml-auto h-3.5 w-3.5 shrink-0 animate-spin text-muted-foreground"
      aria-hidden
    />
  ) : hasResult && !resultHasError ? (
    <CheckCircle
      className="ml-auto h-3.5 w-3.5 shrink-0 text-emerald-500"
      aria-hidden
    />
  ) : hasError || resultHasError ? (
    <AlertCircle
      className="ml-auto h-3.5 w-3.5 shrink-0 text-red-500"
      aria-hidden
    />
  ) : null

  const statusLabel = isLoading
    ? "Running"
    : hasError || resultHasError
      ? "Failed"
      : hasResult
        ? "Done"
        : "Idle"

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      disabled={isLoading}
      className="my-2 overflow-hidden rounded-lg border border-border/60 bg-muted/30"
    >
      <CollapsibleTrigger
        className={cn(
          "flex w-full min-w-0 items-center gap-2 border-b border-border/40 bg-muted/50 px-3 py-2 text-left transition-colors",
          "hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "disabled:pointer-events-none disabled:opacity-100",
        )}
        aria-label={`${displayName} tool, ${statusLabel}. ${open ? "Expanded" : "Collapsed"}. Toggle details.`}
      >
        <ChevronRight
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
            open && "rotate-90",
          )}
          aria-hidden
        />
        <span className="text-muted-foreground">{icon}</span>
        <span className="min-w-0 flex-1 truncate text-sm font-medium">
          {displayName}
        </span>
        {statusIcon}
      </CollapsibleTrigger>

      <CollapsibleContent>
        {isLoading ? (
          <div
            className="px-3 py-2 text-xs text-muted-foreground"
            role="status"
            aria-live="polite"
          >
            Invoking tool…
          </div>
        ) : null}
        {hasError && part.errorText ? (
          <div className="px-3 py-2 text-xs text-red-500">{part.errorText}</div>
        ) : null}
        {hasResult && result ? (
          <div className="px-3 py-2 text-xs">
            {resultHasError ? (
              <div className="text-red-500">{String(result.error)}</div>
            ) : (
              <ToolResultDisplay result={result} toolName={part.toolName} />
            )}
          </div>
        ) : null}
      </CollapsibleContent>
    </Collapsible>
  )
}

function ToolResultDisplay({
  result,
  toolName,
}: {
  result: Record<string, unknown>
  toolName: string
}) {
  if (toolName === "search_courses" && Array.isArray(result.courses)) {
    const courses = result.courses as Array<{
      code: string
      title: string
      credits: number
    }>
    if (courses.length === 0) {
      return <span className="text-muted-foreground">No courses found</span>
    }
    return (
      <div className="space-y-1">
        <span className="text-muted-foreground">
          Found {courses.length} course(s):
        </span>
        <ul className="list-inside list-disc space-y-0.5">
          {courses.slice(0, 5).map((course, i) => (
            <li key={i}>
              <strong>{course.code}</strong> - {course.title} ({course.credits}{" "}
              credits)
            </li>
          ))}
          {courses.length > 5 ? (
            <li className="text-muted-foreground">
              ...and {courses.length - 5} more
            </li>
          ) : null}
        </ul>
      </div>
    )
  }

  if (toolName === "search_facilities" && Array.isArray(result.facilities)) {
    const facilities = result.facilities as Array<{
      name: string
      building: string
      room_number: string
    }>
    if (facilities.length === 0) {
      return <span className="text-muted-foreground">No facilities found</span>
    }
    return (
      <div className="space-y-1">
        <span className="text-muted-foreground">
          Found {facilities.length} facility(ies):
        </span>
        <ul className="list-inside list-disc space-y-0.5">
          {facilities.slice(0, 5).map((facility, i) => (
            <li key={i}>
              <strong>{facility.name}</strong> - {facility.building}, Room{" "}
              {facility.room_number}
            </li>
          ))}
          {facilities.length > 5 ? (
            <li className="text-muted-foreground">
              ...and {facilities.length - 5} more
            </li>
          ) : null}
        </ul>
      </div>
    )
  }

  if (result.message) {
    return (
      <span className="text-emerald-600 dark:text-emerald-400">
        ✓ {String(result.message)}
      </span>
    )
  }

  if (
    toolName === "get_student_registrations" &&
    Array.isArray(result.registrations)
  ) {
    const regs = result.registrations as Array<{
      course_sections?: { courses?: { code: string; title: string } }
    }>
    if (regs.length === 0) {
      return (
        <span className="text-muted-foreground">No active registrations</span>
      )
    }
    return (
      <div className="space-y-1">
        <span className="text-muted-foreground">
          {regs.length} active registration(s)
        </span>
        <ul className="list-inside list-disc space-y-0.5">
          {regs.map((reg, i) => (
            <li key={i}>
              {reg.course_sections?.courses?.code} -{" "}
              {reg.course_sections?.courses?.title}
            </li>
          ))}
        </ul>
      </div>
    )
  }

  if (toolName === "get_student_bookings" && Array.isArray(result.bookings)) {
    const bookings = result.bookings as Array<{
      booking_date: string
      start_time: string
      end_time: string
      status: string
      facilities?: { name: string }
    }>
    if (bookings.length === 0) {
      return <span className="text-muted-foreground">No bookings found</span>
    }
    return (
      <div className="space-y-1">
        <span className="text-muted-foreground">
          {bookings.length} booking(s)
        </span>
        <ul className="list-inside list-disc space-y-0.5">
          {bookings.slice(0, 5).map((booking, i) => (
            <li key={i}>
              {booking.facilities?.name} - {booking.booking_date}{" "}
              {booking.start_time.slice(0, 5)}-{booking.end_time.slice(0, 5)} (
              {booking.status})
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <pre className="max-h-32 overflow-x-auto text-xs text-muted-foreground">
      {JSON.stringify(result, null, 2)}
    </pre>
  )
}

export { ToolInvocation }
