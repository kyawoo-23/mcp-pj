"use client";

import { TOOL_DEFINITIONS } from "@/lib/tool-definitions";
import type { ChatResultActionHandler } from "@/lib/types";
import {
  arrayOf,
  isBooking,
  isCourse,
  isFacility,
  isRegistration,
  isSection,
} from "./tool-result-model";
import {
  BookingResults,
  CourseResults,
  ErrorResult,
  FacilityResults,
  JsonFallback,
  RegistrationResults,
  SectionResults,
  SuccessResult,
} from "./tool-result-views";

const LIST_RESULT_RENDERERS = {
  search_courses: (result: Record<string, unknown>, onAction?: ChatResultActionHandler) => (
    <CourseResults courses={arrayOf(result.courses, isCourse)} onAction={onAction} />
  ),
  get_course_sections: (result: Record<string, unknown>, onAction?: ChatResultActionHandler) => (
    <SectionResults sections={arrayOf(result.sections, isSection)} onAction={onAction} />
  ),
  get_student_registrations: (
    result: Record<string, unknown>,
    onAction?: ChatResultActionHandler,
  ) => (
    <RegistrationResults
      registrations={arrayOf(result.registrations, isRegistration)}
      onAction={onAction}
    />
  ),
  search_facilities: (result: Record<string, unknown>, onAction?: ChatResultActionHandler) => (
    <FacilityResults
      facilities={arrayOf(result.facilities, isFacility)}
      onAction={onAction}
    />
  ),
  get_student_bookings: (
    result: Record<string, unknown>,
    onAction?: ChatResultActionHandler,
  ) => <BookingResults bookings={arrayOf(result.bookings, isBooking)} onAction={onAction} />,
} as const;

const SUCCESS_ONLY_TOOL_NAMES = new Set(["register_course", "drop_course", "book_facility", "cancel_booking"]);

const PRIMARY_TOOL_NAMES = new Set<string>([
  ...Object.keys(LIST_RESULT_RENDERERS),
  ...SUCCESS_ONLY_TOOL_NAMES,
].filter((toolName) => toolName in TOOL_DEFINITIONS));

export function ChatToolResultCards({
  result,
  toolName,
  onAction,
}: {
  result: Record<string, unknown>;
  toolName: string;
  onAction?: ChatResultActionHandler;
}) {
  if ("error" in result || "errorText" in result) {
    return <ErrorResult result={result} />;
  }

  if (typeof result.message === "string") {
    return <SuccessResult result={result} />;
  }

  if (toolName in LIST_RESULT_RENDERERS) {
    return LIST_RESULT_RENDERERS[toolName as keyof typeof LIST_RESULT_RENDERERS](result, onAction);
  }

  if (SUCCESS_ONLY_TOOL_NAMES.has(toolName)) {
    return (
      <SuccessResult result={{ message: "Tool completed successfully." }} />
    );
  }

  return <JsonFallback result={result} />;
}

export function isPrimaryToolResult(toolName: string): boolean {
  return PRIMARY_TOOL_NAMES.has(toolName);
}
