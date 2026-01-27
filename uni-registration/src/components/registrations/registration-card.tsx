"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { StudentRegistrationWithDetails } from "@/lib/types";
import { Clock, MapPin, User, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface RegistrationCardProps {
  registration: StudentRegistrationWithDetails;
  onDrop?: (registrationId: string) => void;
  isLoading?: boolean;
}

export function RegistrationCard({
  registration,
  onDrop,
  isLoading = false,
}: RegistrationCardProps) {
  const section = registration.course_sections;
  const course = section?.courses;

  if (!section || !course) {
    return null;
  }

  const formatTime = (time: string | null) => {
    if (!time) return "TBA";
    try {
      return format(new Date(`2000-01-01T${time}`), "h:mm a");
    } catch {
      return time;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "waitlisted":
        return "secondary";
      case "dropped":
        return "outline";
      case "completed":
        return "default";
      default:
        return "secondary";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className='flex items-start justify-between'>
          <div>
            <CardTitle className='text-lg'>
              {course.code} - {course.title}
            </CardTitle>
            <p className='text-sm text-muted-foreground mt-1'>
              Section {section.section_number}
            </p>
          </div>
          <Badge variant={getStatusBadgeVariant(registration.status)}>
            {registration.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm'>
          {section.schedule_days && section.schedule_days.length > 0 && (
            <div className='flex items-center gap-2'>
              <Clock className='h-4 w-4 text-muted-foreground' />
              <span>
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
            <div className='flex items-center gap-2'>
              <User className='h-4 w-4 text-muted-foreground' />
              <span>{section.instructor}</span>
            </div>
          )}
          {section.room_location && (
            <div className='flex items-center gap-2'>
              <MapPin className='h-4 w-4 text-muted-foreground' />
              <span>{section.room_location}</span>
            </div>
          )}
        </div>
        <div className='flex items-center justify-between text-xs text-muted-foreground'>
          <span>
            Registered:{" "}
            {format(new Date(registration.registered_at), "MMM d, yyyy")}
          </span>
          <span>
            {section.semester} {section.year}
          </span>
        </div>
        {onDrop && registration.status === "active" && (
          <Button
            onClick={() => onDrop(registration.id)}
            disabled={isLoading}
            variant='destructive'
            size='sm'
            className='w-full'
          >
            <Trash2 className='h-4 w-4 mr-2' />
            {isLoading ? "Dropping..." : "Drop Course"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
