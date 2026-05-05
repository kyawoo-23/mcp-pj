"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ChatResultAction, ChatResultActionHandler } from "@/lib/types";

export function ResultPanel({
  title,
  description,
  count,
  children,
  className,
}: {
  title: string;
  description?: string;
  count?: number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "w-full min-w-0 rounded-2xl border border-border/60 bg-background/80 p-3 shadow-sm",
        className,
      )}
      aria-label={title}
    >
      <div className="mb-3 flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <h3 className="text-sm font-semibold leading-tight text-foreground text-pretty">
            {title}
          </h3>
          {description ? (
            <p className="text-xs leading-relaxed text-muted-foreground text-pretty">
              {description}
            </p>
          ) : null}
        </div>
        {typeof count === "number" ? (
          <Badge
            variant="secondary"
            className="shrink-0 self-start tabular-nums"
          >
            {count}
          </Badge>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function ResultGrid({
  children,
  columns = "one",
}: {
  children: React.ReactNode;
  columns?: "one" | "adaptive";
}) {
  return (
    <div
      className={cn(
        "grid min-w-0 gap-2",
        columns === "adaptive" && "min-[720px]:grid-cols-2",
      )}
    >
      {children}
    </div>
  );
}

export function EntityCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        "min-w-0 gap-2 rounded-xl border-border/60 bg-card/80 py-3 shadow-none",
        className,
      )}
    >
      {children}
    </Card>
  );
}

export function MetadataRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs leading-relaxed text-muted-foreground">
      {children}
    </div>
  );
}

export function MetadataItem({
  icon: Icon,
  children,
}: {
  icon?: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5 wrap-break-word">
      {Icon ? <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden /> : null}
      <span className="min-w-0 wrap-break-word">{children}</span>
    </span>
  );
}

export function ActionButton({
  action,
  onAction,
  className,
}: {
  action: ChatResultAction;
  onAction?: ChatResultActionHandler;
  className?: string;
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant={action.variant ?? "secondary"}
      className={cn(
        "min-h-9 w-full touch-manipulation whitespace-normal text-pretty sm:w-auto",
        className,
      )}
      disabled={!onAction}
      onClick={() => onAction?.(action)}
    >
      {action.label}
    </Button>
  );
}

export function EmptyResult({ label }: { label: string }) {
  return (
    <Card className="gap-2 border-dashed bg-muted/20 py-4 shadow-none">
      <CardContent className="px-4 text-center text-sm text-muted-foreground">
        {label}
      </CardContent>
    </Card>
  );
}

export { CardContent, CardDescription, CardFooter, CardHeader, CardTitle };
