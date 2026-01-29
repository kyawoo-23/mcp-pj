"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { CourseSection } from "@/lib/types";
import { Clock, MapPin, User } from "lucide-react";
import { format } from "date-fns";

interface SectionCardProps {
  section: CourseSection;
  onRegister?: (sectionId: string) => void;
  isRegistered?: boolean;
  isLoading?: boolean;
}

export function SectionCard({
  section,
  onRegister,
  isRegistered = false,
  isLoading = false,
}: SectionCardProps) {
  const formatTime = (time: string | null) => {
    if (!time) return "TBA";
    try {
      return format(new Date(`2000-01-01T${time}`), "h:mm a");
    } catch {
      return time;
    }
  };

  return (
    <Card className='w-full'>
      <CardHeader className='px-4 sm:px-6 pb-4 sm:pb-6'>
        <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4'>
          <CardTitle className='text-base sm:text-lg leading-tight'>
            Section {section.section_number}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className='px-4 sm:px-6 space-y-3 sm:space-y-4'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-2.5 md:gap-3 text-xs md:text-sm'>
          {section.schedule_days && section.schedule_days.length > 0 && (
            <div className='flex items-start gap-2 min-w-0'>
              <Clock className='h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground shrink-0 mt-0.5' />
              <span className='wrap-break-word'>
                {section.schedule_days.join(", ")}{" "}
                {section.start_time && section.end_time && (
                  <>
                    {formatTime(section.start_time)} -{" "}
                    {formatTime(section.end_time)}
                  </>
                )}
              </span>
            </div>
          )}
          {section.instructor && (
            <div className='flex items-start gap-2 min-w-0'>
              <User className='h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground shrink-0 mt-0.5' />
              <span className='wrap-break-word truncate'>
                {section.instructor}
              </span>
            </div>
          )}
          {section.room_location && (
            <div className='flex items-start gap-2 min-w-0'>
              <MapPin className='h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground shrink-0 mt-0.5' />
              <span className='wrap-break-word'>{section.room_location}</span>
            </div>
          )}
        </div>
        <div className='flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground pt-1'>
          <span>
            {section.semester} {section.year}
          </span>
        </div>
        {onRegister && (
          <Button
            onClick={() => onRegister(section.id)}
            disabled={isRegistered || isLoading}
            className='w-full text-sm sm:text-base h-9 sm:h-10'
            variant={isRegistered ? "secondary" : "default"}
          >
            {isLoading
              ? "Registering..."
              : isRegistered
                ? "Registered"
                : "Register"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
