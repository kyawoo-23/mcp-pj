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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Controller } from "react-hook-form";
import { cn } from "@/lib/utils";
import type { ChatResultActionHandler } from "@/lib/types";
import {
  CollapsibleChevron,
  collapsibleTriggerFocusClasses,
} from "@/components/chat/tool-collapsible";
import type { FacilitySummary } from "./tool-result-model";

const bookingRequestSchema = z
  .object({
    bookingDate: z
      .string()
      .min(1, "Date is required")
      .refine((val) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const date = new Date(val);
        return date >= today;
      }, "Date cannot be in the past"),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
    purpose: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.startTime || !data.endTime) return true;
      return data.startTime < data.endTime;
    },
    {
      message: "End time must be after start time",
      path: ["endTime"],
    },
  );

export type BookingRequestFormData = z.infer<typeof bookingRequestSchema>;

interface TimeOption {
  value: string;
  label: string;
}

function generateTimeOptions(): TimeOption[] {
  const options: TimeOption[] = [];
  for (let hour = 8; hour <= 21; hour++) {
    const timeValue = `${hour.toString().padStart(2, "0")}:00`;
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    const ampm = hour >= 12 ? "PM" : "AM";
    const label = `${displayHour}:00 ${ampm}`;
    options.push({ value: timeValue, label });
  }
  return options;
}

const timeOptions = generateTimeOptions();

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
    control,
    watch,
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

  const startTime = watch("startTime");

  const onSubmit = (data: BookingRequestFormData) => {
    onAction?.({
      kind: "request-booking",
      label: "Request booking",
      prompt: `I want to book ${facility.name} on ${data.bookingDate} from ${data.startTime} to ${data.endTime}. Purpose: ${data.purpose?.trim() || "not specified"}. Please confirm these details before booking.`,
      data: {
        facilityId: facility.id,
        bookingDate: data.bookingDate,
        startTime: data.startTime,
        endTime: data.endTime,
      },
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
            {/* Booking Date */}
            <div className="space-y-1">
              <Label className="text-xs" htmlFor={`bookingDate-${prefix}`}>
                Date
              </Label>
              <Input
                id={`bookingDate-${prefix}`}
                type="date"
                autoComplete="off"
                className="h-9 text-xs"
                min={new Date().toISOString().split("T")[0]}
                aria-invalid={Boolean(errors.bookingDate)}
                {...register("bookingDate")}
              />
              <FieldError message={errors.bookingDate?.message} />
            </div>

            {/* Start Time */}
            <div className="space-y-1">
              <Label className="text-xs" htmlFor={`startTime-${prefix}`}>
                Start
              </Label>
              <Controller
                name="startTime"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger
                      id={`startTime-${prefix}`}
                      className="h-9 w-full text-xs"
                      aria-invalid={Boolean(errors.startTime)}
                    >
                      <SelectValue placeholder="Start" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError message={errors.startTime?.message} />
            </div>

            {/* End Time */}
            <div className="space-y-1">
              <Label className="text-xs" htmlFor={`endTime-${prefix}`}>
                End
              </Label>
              <Controller
                name="endTime"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!startTime}
                  >
                    <SelectTrigger
                      id={`endTime-${prefix}`}
                      className="h-9 w-full text-xs"
                      aria-invalid={Boolean(errors.endTime)}
                    >
                      <SelectValue placeholder={startTime ? "End" : "---"} />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions
                        .filter(
                          (option) => !startTime || option.value > startTime,
                        )
                        .map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError message={errors.endTime?.message} />
            </div>
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
