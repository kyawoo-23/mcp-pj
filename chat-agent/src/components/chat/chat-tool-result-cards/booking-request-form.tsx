"use client";

import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { ChatResultActionHandler } from "@/lib/types";
import {
  CollapsibleChevron,
  collapsibleTriggerFocusClasses,
} from "@/components/chat/tool-collapsible";
import type { FacilitySummary } from "./tool-result-model";

const bookingRequestSchema = z.object({
  bookingDate: z.string().min(1, "Date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  purpose: z.string().optional(),
});

export type BookingRequestFormData = z.infer<typeof bookingRequestSchema>;

const BOOKING_GRID_FIELDS = [
  { key: "bookingDate", label: "Date", inputType: "date" },
  { key: "startTime", label: "Start", inputType: "time" },
  { key: "endTime", label: "End", inputType: "time" },
] as const satisfies ReadonlyArray<{
  key: keyof Pick<
    BookingRequestFormData,
    "bookingDate" | "startTime" | "endTime"
  >;
  label: string;
  inputType: "date" | "time";
}>;

function FieldError({ message }: { message?: string }) {
  return message ? (
    <p className="text-xs text-destructive" aria-live="polite">
      {message}
    </p>
  ) : null;
}

export function BookingRequestForm({
  facility,
  onAction,
}: {
  facility: FacilitySummary;
  onAction?: ChatResultActionHandler;
}) {
  const [open, setOpen] = React.useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingRequestFormData>({
    resolver: zodResolver(bookingRequestSchema),
    defaultValues: {
      bookingDate: "",
      startTime: "",
      endTime: "",
      purpose: "",
    },
  });

  const onSubmit = (data: BookingRequestFormData) => {
    onAction?.({
      kind: "request-booking",
      label: "Request booking",
      prompt: `I want to book ${facility.name}. Facility ID: ${facility.id}. Date: ${data.bookingDate}. Time: ${data.startTime} to ${data.endTime}. Purpose: ${data.purpose?.trim() || "not specified"}. Please confirm these details before booking.`,
    });
  };

  const prefix = facility.id;

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="overflow-hidden rounded-lg border border-border/60 bg-muted/15"
    >
      <CollapsibleTrigger
        className={cn(
          "flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs font-medium text-foreground transition-colors hover:bg-muted/40 touch-manipulation",
          collapsibleTriggerFocusClasses,
        )}
      >
        <span>Quick Booking Details</span>
        <CollapsibleChevron open={open} size="sm" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <form
          className="space-y-3 border-t border-border/50 p-3"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="grid gap-3 sm:grid-cols-3">
            {BOOKING_GRID_FIELDS.map(({ key, label, inputType }) => {
              const id = `${key}-${prefix}`;
              const fieldError = errors[key];
              return (
                <div key={key} className="space-y-1">
                  <Label className="text-xs" htmlFor={id}>
                    {label}
                  </Label>
                  <Input
                    id={id}
                    type={inputType}
                    autoComplete="off"
                    className="h-9 text-xs"
                    aria-invalid={Boolean(fieldError)}
                    {...register(key)}
                  />
                  <FieldError message={fieldError?.message} />
                </div>
              );
            })}
          </div>
          <div className="space-y-1">
            <Label className="text-xs" htmlFor={`purpose-${prefix}`}>
              Purpose
            </Label>
            <Textarea
              id={`purpose-${prefix}`}
              autoComplete="off"
              className="min-h-16 text-xs"
              placeholder="Study group…"
              {...register("purpose")}
            />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="submit"
              size="sm"
              className="w-full touch-manipulation sm:w-auto"
              disabled={!onAction}
            >
              Request Booking
            </Button>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Sends a chat reply; the assistant still asks for confirmation.
            </p>
          </div>
        </form>
      </CollapsibleContent>
    </Collapsible>
  );
}
