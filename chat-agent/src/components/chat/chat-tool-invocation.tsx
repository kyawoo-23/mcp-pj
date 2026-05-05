"use client"

import * as React from "react"
import { Search, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { TOOL_DEFINITIONS } from "@/lib/tool-definitions"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import {
  CollapsibleChevron,
  collapsibleTriggerFocusClassesOffset,
} from "@/components/chat/tool-collapsible"
import type { ChatResultActionHandler, ToolInvocationPart } from "@/lib/types"
import { normalizeToolResultOutput } from "@/lib/chat-tool-results"
import {
  ChatToolResultCards,
  isPrimaryToolResult,
} from "./chat-tool-result-cards"

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

function ToolInvocation({
  part,
  onAction,
}: {
  part: ToolInvocationPart
  onAction?: ChatResultActionHandler
}) {
  const toolDef = TOOL_DEFINITIONS[part.toolName]
  const IconComponent = toolDef?.icon || Search
  const icon = <IconComponent className="h-4 w-4 shrink-0" aria-hidden />
  const displayName = toolDef?.displayName || part.toolName
  const isLoading =
    part.state === "input-streaming" || part.state === "input-available"
  const hasResult = part.state === "output-available"
  const hasError = part.state === "output-error"
  const result = normalizeToolResultOutput(part.output)
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

  if (
    hasResult &&
    result &&
    !resultHasError &&
    isPrimaryToolResult(part.toolName)
  ) {
    return (
      <div className="my-2 w-full">
        <ChatToolResultCards
          result={result}
          toolName={part.toolName}
          onAction={onAction}
        />
      </div>
    )
  }

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      disabled={isLoading}
      className="my-2 overflow-hidden rounded-lg border border-border/60 bg-muted/30"
    >
      <CollapsibleTrigger
        className={cn(
          "flex w-full min-w-0 touch-manipulation items-center gap-2 border-b border-border/40 bg-muted/50 px-3 py-2 text-left transition-colors",
          "hover:bg-muted/70",
          collapsibleTriggerFocusClassesOffset,
          "disabled:pointer-events-none disabled:opacity-100",
        )}
        aria-label={`${displayName} tool, ${statusLabel}. ${open ? "Expanded" : "Collapsed"}. Toggle details.`}
      >
        <CollapsibleChevron open={open} />
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
          <div className="px-3 py-3 text-xs">
            <ChatToolResultCards
              result={result}
              toolName={part.toolName}
              onAction={onAction}
            />
          </div>
        ) : null}
      </CollapsibleContent>
    </Collapsible>
  )
}

export { ToolInvocation }
