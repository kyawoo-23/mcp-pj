"use client";

import {
  AlertCircle,
  BookOpen,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  MapPin,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { ChatResultActionHandler } from "@/lib/types";
import {
  ActionButton,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  EmptyResult,
  EntityCard,
  MetadataItem,
  MetadataRow,
  ResultGrid,
  ResultPanel,
} from "./tool-result-primitives";
import {
  formatDateTimeRange,
  formatLocation,
  type BookingSummary,
  type CourseSectionSummary,
  type CourseSummary,
  type FacilitySummary,
  type RegistrationSummary,
} from "./tool-result-model";
import { BookingRequestForm } from "./booking-request-form";

export function ErrorResult({ result }: { result: Record<string, unknown> }) {
  const message = String(
    result.error ?? result.errorText ?? "Something went wrong.",
  );
  const code = typeof result.errorCode === "string" ? result.errorCode : null;

  return (
    <Alert variant="destructive" className="bg-destructive/5">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="space-y-1">
        {code ? (
          <div className="text-xs font-medium uppercase">{code}</div>
        ) : null}
        <div>{message}</div>
      </AlertDescription>
    </Alert>
  );
}

export function SuccessResult({ result }: { result: Record<string, unknown> }) {
  return (
    <Card className="gap-3 border-emerald-500/30 bg-emerald-500/5 py-4 shadow-none">
      <CardContent className="flex items-start gap-3 px-4">
        <CheckCircle
          className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400"
          aria-hidden
        />
        <div className="min-w-0 space-y-1">
          <div className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
            {String(result.message)}
          </div>
          <div className="text-xs text-muted-foreground">
            This update was completed through the chat agent tools.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function CourseResults({
  courses,
  onAction,
}: {
  courses: CourseSummary[];
  onAction?: ChatResultActionHandler;
}) {
  if (courses.length === 0) {
    return <EmptyResult label="No courses found." />;
  }

  return (
    <ResultPanel
      title="Course Results"
      description="Choose a course to see available sections."
      count={courses.length}
    >
      <div className="max-h-120 overflow-y-auto pr-1">
        <ResultGrid columns="adaptive">
          {courses.map((course) => (
            <EntityCard key={course.id}>
              <CardHeader className="gap-2 px-3">
                <div className="flex min-w-0 items-start gap-2">
                  <BookOpen
                    className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1 space-y-1">
                    <CardTitle className="wrap-break-word text-sm leading-snug">
                      <span translate="no">{course.code}</span> - {course.title}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {course.credits ? `${course.credits} credits` : "Course"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              {course.description ? (
                <CardContent className="px-3 text-xs leading-relaxed text-muted-foreground">
                  <p className="line-clamp-3 wrap-break-word">
                    {course.description}
                  </p>
                </CardContent>
              ) : null}
              <CardFooter className="px-3 pt-1">
                <ActionButton
                  onAction={onAction}
                  action={{
                    kind: "select-course",
                    label: "View Sections",
                    prompt: `Show me available sections for ${course.code} - ${course.title}.`,
                    data: { courseId: course.id },
                  }}
                />
              </CardFooter>
            </EntityCard>
          ))}
        </ResultGrid>
      </div>
    </ResultPanel>
  );
}

export function SectionResults({
  sections,
  onAction,
}: {
  sections: CourseSectionSummary[];
  onAction?: ChatResultActionHandler;
}) {
  if (sections.length === 0) {
    return <EmptyResult label="No sections found for this course." />;
  }

  return (
    <ResultPanel
      title="Available Sections"
      description="Review the section details before confirming registration."
      count={sections.length}
    >
      <ResultGrid columns="adaptive">
        {sections.map((section) => {
          const courseLabel = section.courses
            ? `${section.courses.code} - ${section.courses.title}`
            : "this course";
          return (
            <EntityCard key={section.id}>
              <CardHeader className="gap-2 px-3">
                <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 space-y-1">
                    <CardTitle className="wrap-break-word text-sm leading-snug">
                      Section{" "}
                      <span translate="no">{section.section_number}</span>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {[section.semester, section.year]
                        .filter(Boolean)
                        .join(" ") || "Term TBD"}
                    </CardDescription>
                  </div>
                  <Badge
                    variant="outline"
                    className="w-fit shrink-0 tabular-nums"
                  >
                    {formatDateTimeRange(section.start_time, section.end_time)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="px-3">
                <MetadataRow>
                  {section.instructor ? (
                    <MetadataItem>
                      Instructor: {section.instructor}
                    </MetadataItem>
                  ) : null}
                  {section.schedule_days?.length ? (
                    <MetadataItem>
                      Days: {section.schedule_days.join(", ")}
                    </MetadataItem>
                  ) : null}
                  {section.room_location ? (
                    <MetadataItem icon={MapPin}>
                      {section.room_location}
                    </MetadataItem>
                  ) : null}
                </MetadataRow>
              </CardContent>
              <CardFooter className="px-3 pt-1">
                <ActionButton
                  onAction={onAction}
                  action={{
                    kind: "confirm-registration",
                    label: "Confirm Registration",
                    variant: "default",
                    prompt: `Yes, please register me for ${courseLabel}, section ${section.section_number}.`,
                    data: { sectionId: section.id },
                  }}
                />
              </CardFooter>
            </EntityCard>
          );
        })}
      </ResultGrid>
    </ResultPanel>
  );
}

export function RegistrationResults({
  registrations,
  onAction,
}: {
  registrations: RegistrationSummary[];
  onAction?: ChatResultActionHandler;
}) {
  if (registrations.length === 0) {
    return <EmptyResult label="No active registrations found." />;
  }

  return (
    <ResultPanel
      title="Active Registrations"
      description="Choose a registration only if you are ready to drop it."
      count={registrations.length}
    >
      <ResultGrid columns="adaptive">
        {registrations.map((registration) => {
          const section = registration.course_sections;
          const course = section?.courses;
          const title = course
            ? `${course.code} - ${course.title}`
            : `Section ${registration.section_id}`;
          return (
            <EntityCard key={registration.id}>
              <CardHeader className="gap-2 px-3">
                <div className="min-w-0 space-y-1">
                  <CardTitle className="wrap-break-word text-sm leading-snug">
                    {course ? <span translate="no">{course.code}</span> : null}
                    {course ? " - " : null}
                    {course?.title ?? title}
                  </CardTitle>
                  <CardDescription className="wrap-break-word text-xs">
                    Section {section?.section_number ?? registration.section_id}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="px-3">
                <MetadataRow>
                  {section?.instructor ? (
                    <MetadataItem>
                      Instructor: {section.instructor}
                    </MetadataItem>
                  ) : null}
                  {section ? (
                    <MetadataItem icon={Clock}>
                      {formatDateTimeRange(
                        section.start_time,
                        section.end_time,
                      )}
                    </MetadataItem>
                  ) : null}
                  {registration.status ? (
                    <MetadataItem>Status: {registration.status}</MetadataItem>
                  ) : null}
                </MetadataRow>
              </CardContent>
              <CardFooter className="px-3 pt-1">
                <ActionButton
                  onAction={onAction}
                  action={{
                    kind: "confirm-drop",
                    label: "Confirm Drop",
                    variant: "destructive",
                    prompt: `Yes, please drop ${title}.`,
                    data: { sectionId: registration.section_id },
                  }}
                />
              </CardFooter>
            </EntityCard>
          );
        })}
      </ResultGrid>
    </ResultPanel>
  );
}

export function FacilityResults({
  facilities,
  onAction,
}: {
  facilities: FacilitySummary[];
  onAction?: ChatResultActionHandler;
}) {
  if (facilities.length === 0) {
    return <EmptyResult label="No facilities found." />;
  }

  return (
    <ResultPanel
      title="Facility Results"
      description="Choose a facility, then optionally add quick booking details."
      count={facilities.length}
    >
      <div className="max-h-120 overflow-y-auto pr-1">
        <ResultGrid>
          {facilities.map((facility) => (
            <EntityCard key={facility.id}>
              <CardHeader className="gap-2 px-3">
                <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 items-start gap-2">
                    <Building2
                      className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1 space-y-1">
                      <CardTitle className="wrap-break-word text-sm leading-snug">
                        {facility.name}
                      </CardTitle>
                      <CardDescription className="flex min-w-0 items-start gap-1 wrap-break-word text-xs">
                        <MapPin
                          className="mt-0.5 h-3 w-3 shrink-0"
                          aria-hidden
                        />
                        <span>
                          {formatLocation(
                            facility.building,
                            facility.room_number,
                          ) || "Location TBD"}
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                  {facility.facility_type ? (
                    <Badge variant="outline" className="w-fit shrink-0">
                      {facility.facility_type.replace(/_/g, " ")}
                    </Badge>
                  ) : null}
                </div>
              </CardHeader>
              {facility.description || facility.amenities?.length ? (
                <CardContent className="space-y-2 px-3 text-xs leading-relaxed text-muted-foreground">
                  {facility.description ? (
                    <p className="wrap-break-word">{facility.description}</p>
                  ) : null}
                  {facility.amenities?.length ? (
                    <p className="wrap-break-word">
                      Amenities: {facility.amenities.join(", ")}
                    </p>
                  ) : null}
                </CardContent>
              ) : null}
              <CardFooter className="flex-col items-stretch gap-3 px-3 pt-1">
                <ActionButton
                  onAction={onAction}
                  action={{
                    kind: "select-facility",
                    label: "Choose Facility",
                    prompt: `I choose ${facility.name}. Please help me pick a booking date and time.`,
                    data: { facilityId: facility.id },
                  }}
                />
                <BookingRequestForm facility={facility} onAction={onAction} />
              </CardFooter>
            </EntityCard>
          ))}
        </ResultGrid>
      </div>
    </ResultPanel>
  );
}

export function BookingResults({
  bookings,
  onAction,
}: {
  bookings: BookingSummary[];
  onAction?: ChatResultActionHandler;
}) {
  if (bookings.length === 0) {
    return <EmptyResult label="No bookings found." />;
  }

  return (
    <ResultPanel
      title="Your Bookings"
      description="Only active and pending bookings can be canceled."
      count={bookings.length}
    >
      <div className="max-h-120 overflow-y-auto pr-1">
        <ResultGrid columns="adaptive">
          {bookings.map((booking) => {
            const facilityName = booking.facilities?.name ?? "Facility booking";
            const canCancel =
              booking.status !== "cancelled" && booking.status !== "completed";
            return (
              <EntityCard key={booking.id}>
                <CardHeader className="gap-2 px-3">
                  <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 space-y-1">
                      <CardTitle className="wrap-break-word text-sm leading-snug">
                        {facilityName}
                      </CardTitle>
                      <div className="text-muted-foreground">
                        <MetadataRow>
                          <MetadataItem icon={Calendar}>
                            {booking.booking_date}
                          </MetadataItem>
                          <MetadataItem icon={Clock}>
                            {formatDateTimeRange(
                              booking.start_time,
                              booking.end_time,
                            )}
                          </MetadataItem>
                        </MetadataRow>
                      </div>
                    </div>
                    {booking.status ? (
                      <Badge variant="outline" className="w-fit shrink-0">
                        {booking.status}
                      </Badge>
                    ) : null}
                  </div>
                </CardHeader>
                {booking.purpose ? (
                  <CardContent className="px-3 text-xs leading-relaxed text-muted-foreground">
                    <p className="wrap-break-word">
                      Purpose: {booking.purpose}
                    </p>
                  </CardContent>
                ) : null}
                {canCancel ? (
                  <CardFooter className="px-3 pt-1">
                    <ActionButton
                      onAction={onAction}
                      action={{
                        kind: "confirm-cancel",
                        label: "Confirm Cancel",
                        variant: "destructive",
                        prompt: `Yes, please cancel my booking for ${facilityName} on ${booking.booking_date}.`,
                        data: { bookingId: booking.id },
                      }}
                    />
                  </CardFooter>
                ) : null}
              </EntityCard>
            );
          })}
        </ResultGrid>
      </div>
    </ResultPanel>
  );
}

export function JsonFallback({ result }: { result: Record<string, unknown> }) {
  return (
    <pre className="max-h-40 overflow-x-auto rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
      {JSON.stringify(result, null, 2)}
    </pre>
  );
}
