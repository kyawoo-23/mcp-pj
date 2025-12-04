"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StudentRegistrationWithDetails } from "@/lib/types";
import { format } from "date-fns";

interface ScheduleViewProps {
  registrations: StudentRegistrationWithDetails[];
}

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function ScheduleView({ registrations }: ScheduleViewProps) {
  const activeRegistrations = registrations.filter(
    (reg) => reg.status === "active"
  );

  const formatTime = (time: string | null) => {
    if (!time) return "TBA";
    try {
      return format(new Date(`2000-01-01T${time}`), "h:mm a");
    } catch {
      return time;
    }
  };

  const getSectionsByDay = () => {
    const sectionsByDay: Record<string, any[]> = {};
    
    DAYS_OF_WEEK.forEach((day) => {
      sectionsByDay[day] = [];
    });

    activeRegistrations.forEach((registration) => {
      const section = registration.course_sections as any;
      const course = section?.courses;

      if (!section || !course || !section.schedule_days) return;

      section.schedule_days.forEach((day: string) => {
        if (sectionsByDay[day]) {
          sectionsByDay[day].push({
            course,
            section,
            registration,
          });
        }
      });
    });

    // Sort by start time
    Object.keys(sectionsByDay).forEach((day) => {
      sectionsByDay[day].sort((a, b) => {
        const timeA = a.section.start_time || "";
        const timeB = b.section.start_time || "";
        return timeA.localeCompare(timeB);
      });
    });

    return sectionsByDay;
  };

  const sectionsByDay = getSectionsByDay();

  return (
    <div className="space-y-4">
      {DAYS_OF_WEEK.map((day) => {
        const sections = sectionsByDay[day];
        if (sections.length === 0) return null;

        return (
          <Card key={day}>
            <CardHeader>
              <CardTitle className="text-lg">{day}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sections.map(({ course, section, registration }) => (
                  <div
                    key={registration.id}
                    className="flex items-start justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium">
                        {course.code} - {course.title}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Section {section.section_number}
                        {section.start_time && section.end_time && (
                          <>
                            {" • "}
                            {formatTime(section.start_time)} -{" "}
                            {formatTime(section.end_time)}
                          </>
                        )}
                        {section.room_location && (
                          <> • {section.room_location}</>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
      {activeRegistrations.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No active registrations to display in schedule.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

