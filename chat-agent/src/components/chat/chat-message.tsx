import { cn } from "@/lib/utils";
import { UserAvatar, AssistantAvatar, SystemIcon } from "./icons/message-icons";
import ReactMarkdown from "react-markdown";
import {
  Search,
  BookOpen,
  Calendar,
  Building2,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import type {
  TextPart,
  ToolInvocationPart,
  ChatMessageData,
} from "@/lib/types";

interface ChatMessageProps {
  message: ChatMessageData;
  showTimestamp?: boolean;
}

// Tool icon mapping
const toolIcons: Record<string, React.ReactNode> = {
  search_courses: <Search className='h-4 w-4' />,
  get_course_details: <BookOpen className='h-4 w-4' />,
  register_course: <CheckCircle className='h-4 w-4' />,
  get_student_registrations: <Calendar className='h-4 w-4' />,
  search_facilities: <Building2 className='h-4 w-4' />,
  book_facility: <Calendar className='h-4 w-4' />,
  get_student_bookings: <Calendar className='h-4 w-4' />,
};

// Human-readable tool names
const toolDisplayNames: Record<string, string> = {
  search_courses: "Searching courses",
  get_course_details: "Getting course details",
  register_course: "Registering for course",
  get_student_registrations: "Fetching your registrations",
  search_facilities: "Searching facilities",
  book_facility: "Booking facility",
  get_student_bookings: "Fetching your bookings",
};

function ToolInvocation({ part }: { part: ToolInvocationPart }) {
  const icon = toolIcons[part.toolName] || <Search className='h-4 w-4' />;
  const displayName = toolDisplayNames[part.toolName] || part.toolName;
  const isLoading =
    part.state === "input-streaming" || part.state === "input-available";
  const hasResult = part.state === "output-available";
  const hasError = part.state === "output-error";
  const result = part.output as Record<string, unknown> | undefined;
  const resultHasError = result && "error" in result;

  return (
    <div className='my-2 rounded-lg border border-border/60 bg-muted/30 overflow-hidden'>
      {/* Tool Header */}
      <div className='flex items-center gap-2 px-3 py-2 bg-muted/50 border-b border-border/40'>
        <span className='text-muted-foreground'>{icon}</span>
        <span className='text-sm font-medium'>{displayName}</span>
        {isLoading && (
          <Loader2 className='h-3 w-3 animate-spin text-muted-foreground ml-auto' />
        )}
        {hasResult && !resultHasError && (
          <CheckCircle className='h-3 w-3 text-emerald-500 ml-auto' />
        )}
        {(hasError || resultHasError) && (
          <AlertCircle className='h-3 w-3 text-red-500 ml-auto' />
        )}
      </div>

      {/* Tool Result */}
      {hasError && part.errorText && (
        <div className='px-3 py-2 text-xs text-red-500'>{part.errorText}</div>
      )}
      {hasResult && result && (
        <div className='px-3 py-2 text-xs'>
          {resultHasError ? (
            <div className='text-red-500'>{String(result.error)}</div>
          ) : (
            <ToolResultDisplay result={result} toolName={part.toolName} />
          )}
        </div>
      )}
    </div>
  );
}

// Component to display tool results in a human-readable format
function ToolResultDisplay({
  result,
  toolName,
}: {
  result: Record<string, unknown>;
  toolName: string;
}) {
  // Course search results
  if (toolName === "search_courses" && Array.isArray(result.courses)) {
    const courses = result.courses as Array<{
      code: string;
      title: string;
      credits: number;
    }>;
    if (courses.length === 0) {
      return <span className='text-muted-foreground'>No courses found</span>;
    }
    return (
      <div className='space-y-1'>
        <span className='text-muted-foreground'>
          Found {courses.length} course(s):
        </span>
        <ul className='list-disc list-inside space-y-0.5'>
          {courses.slice(0, 5).map((course, i) => (
            <li key={i}>
              <strong>{course.code}</strong> - {course.title} ({course.credits}{" "}
              credits)
            </li>
          ))}
          {courses.length > 5 && (
            <li className='text-muted-foreground'>
              ...and {courses.length - 5} more
            </li>
          )}
        </ul>
      </div>
    );
  }

  // Facility search results
  if (toolName === "search_facilities" && Array.isArray(result.facilities)) {
    const facilities = result.facilities as Array<{
      name: string;
      building: string;
      room_number: string;
      capacity: number;
    }>;
    if (facilities.length === 0) {
      return <span className='text-muted-foreground'>No facilities found</span>;
    }
    return (
      <div className='space-y-1'>
        <span className='text-muted-foreground'>
          Found {facilities.length} facility(ies):
        </span>
        <ul className='list-disc list-inside space-y-0.5'>
          {facilities.slice(0, 5).map((facility, i) => (
            <li key={i}>
              <strong>{facility.name}</strong> - {facility.building}, Room{" "}
              {facility.room_number} (capacity: {facility.capacity})
            </li>
          ))}
          {facilities.length > 5 && (
            <li className='text-muted-foreground'>
              ...and {facilities.length - 5} more
            </li>
          )}
        </ul>
      </div>
    );
  }

  // Booking/registration success
  if (result.message) {
    return (
      <span className='text-emerald-600 dark:text-emerald-400'>
        ✓ {String(result.message)}
      </span>
    );
  }

  // Registrations list
  if (
    toolName === "get_student_registrations" &&
    Array.isArray(result.registrations)
  ) {
    const regs = result.registrations as Array<{
      course_sections?: { courses?: { code: string; title: string } };
    }>;
    if (regs.length === 0) {
      return (
        <span className='text-muted-foreground'>No active registrations</span>
      );
    }
    return (
      <div className='space-y-1'>
        <span className='text-muted-foreground'>
          {regs.length} active registration(s)
        </span>
        <ul className='list-disc list-inside space-y-0.5'>
          {regs.map((reg, i) => (
            <li key={i}>
              {reg.course_sections?.courses?.code} -{" "}
              {reg.course_sections?.courses?.title}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // Bookings list
  if (toolName === "get_student_bookings" && Array.isArray(result.bookings)) {
    const bookings = result.bookings as Array<{
      booking_date: string;
      start_time: string;
      end_time: string;
      status: string;
      facilities?: { name: string };
    }>;
    if (bookings.length === 0) {
      return <span className='text-muted-foreground'>No bookings found</span>;
    }
    return (
      <div className='space-y-1'>
        <span className='text-muted-foreground'>
          {bookings.length} booking(s)
        </span>
        <ul className='list-disc list-inside space-y-0.5'>
          {bookings.slice(0, 5).map((booking, i) => (
            <li key={i}>
              {booking.facilities?.name} - {booking.booking_date}{" "}
              {booking.start_time.slice(0, 5)}-{booking.end_time.slice(0, 5)} (
              {booking.status})
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // Default: show simplified JSON
  return (
    <pre className='text-xs text-muted-foreground overflow-x-auto max-h-32'>
      {JSON.stringify(result, null, 2)}
    </pre>
  );
}

export function ChatMessage({
  message,
  showTimestamp = false,
}: ChatMessageProps) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  if (isSystem) {
    const textContent = message.parts
      .filter((p): p is TextPart => p.type === "text")
      .map((p) => p.text)
      .join("");

    return (
      <div className='flex w-full justify-center py-4'>
        <div className='flex items-center gap-2 rounded-lg bg-muted/50 px-4 py-2 text-sm text-muted-foreground'>
          <SystemIcon />
          <span>{textContent}</span>
        </div>
      </div>
    );
  }

  // Separate text parts and tool parts
  const textParts = message.parts.filter(
    (p): p is TextPart => p.type === "text"
  );
  const toolParts = message.parts.filter(
    (p): p is ToolInvocationPart => p.type === "tool-invocation"
  );
  const textContent = textParts.map((p) => p.text).join("");

  return (
    <div
      className={cn(
        "flex w-full gap-4 py-4 px-2 md:px-4",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div className='shrink-0 pt-1'>
        {isUser ? <UserAvatar /> : <AssistantAvatar />}
      </div>

      {/* Content */}
      <div
        className={cn(
          "flex max-w-[80%] flex-col gap-1",
          isUser ? "items-end" : "items-start"
        )}
      >
        {/* Tool Invocations (for assistant messages) */}
        {!isUser && toolParts.length > 0 && (
          <div className='w-full space-y-2'>
            {toolParts.map((part) => (
              <ToolInvocation key={part.toolCallId} part={part} />
            ))}
          </div>
        )}

        {/* Text Content Bubble */}
        {textContent && (
          <div
            className={cn(
              "rounded-2xl px-4 py-3 text-sm shadow-sm",
              isUser
                ? "bg-primary text-primary-foreground rounded-tr-sm"
                : "bg-muted/60 text-foreground border border-border/50 rounded-tl-sm"
            )}
          >
            <div className='prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap leading-relaxed'>
              <ReactMarkdown>{textContent}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* Optional Timestamp */}
        {showTimestamp && message.timestamp && (
          <span className='px-1 text-xs text-muted-foreground'>
            {message.timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>
    </div>
  );
}
