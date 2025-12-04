import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Course } from "@/lib/types";
import { BookOpen } from "lucide-react";

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Link href={`/courses/${course.id}`} className='block h-full'>
      <Card className='h-full hover:shadow-lg hover:border-primary/50 transition-all duration-200 cursor-pointer group'>
        <CardHeader className='px-4 sm:px-6 pb-3 sm:pb-4'>
          <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4'>
            <div className='flex-1 min-w-0'>
              <CardTitle className='flex items-center gap-2 text-base sm:text-lg leading-tight group-hover:text-primary transition-colors'>
                <BookOpen className='h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0' />
                <span className='wrap-break-word'>{course.code}</span>
              </CardTitle>
              <CardDescription className='mt-1.5 sm:mt-2 text-xs sm:text-sm line-clamp-2'>
                {course.title}
              </CardDescription>
            </div>
            {course.department && (
              <Badge
                variant='secondary'
                className='w-fit text-xs sm:text-sm shrink-0'
              >
                {course.department}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className='px-4 sm:px-6 pt-0 space-y-3'>
          <div className='flex items-center gap-2 text-xs sm:text-sm text-muted-foreground'>
            <span className='font-medium'>
              {course.credits} credit{course.credits !== 1 ? "s" : ""}
            </span>
          </div>
          {course.description && (
            <p className='text-xs sm:text-sm text-muted-foreground line-clamp-2 wrap-break-word'>
              {course.description}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
