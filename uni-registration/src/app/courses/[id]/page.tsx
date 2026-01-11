import { Suspense } from "react";
import { getCourseById, getCourseSections } from "@/app/actions/courses";
import { getUserRegistrations } from "@/app/actions/registrations";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { BookOpen } from "lucide-react";
import CourseDetailClient from "./course-detail-client";
import { notFound } from "next/navigation";

async function CourseDetail({ courseId }: { courseId: string }) {
  // Parallelize all API calls for faster loading
  const [courseResult, sectionsResult, registrationsResult] = await Promise.all(
    [
      getCourseById(courseId),
      getCourseSections(courseId),
      getUserRegistrations(),
    ]
  );

  if (courseResult.error || !courseResult.data) {
    notFound();
  }

  const course = courseResult.data;
  const sections = sectionsResult.data;
  const registrations = registrationsResult.data;

  const registeredSectionIds =
    registrations
      ?.filter((reg) => reg.status === "active" || reg.status === "waitlisted")
      .map((reg) => reg.section_id) || [];

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <div className='flex items-start justify-between'>
            <div className='flex-1'>
              <CardTitle className='flex items-center gap-2 text-2xl'>
                <BookOpen className='h-6 w-6 text-primary' />
                {course.code}
              </CardTitle>
              <CardDescription className='mt-2 text-base'>
                {course.title}
              </CardDescription>
            </div>
            {course.department && (
              <Badge variant='secondary' className='text-sm'>
                {course.department}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div className='flex items-center gap-4 text-sm'>
              <span className='font-medium'>{course.credits} credits</span>
            </div>
            {course.description && (
              <p className='text-sm text-muted-foreground'>
                {course.description}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className='text-xl font-semibold mb-4'>Available Sections</h2>
        <CourseDetailClient
          sections={sections || []}
          registeredSectionIds={registeredSectionIds}
        />
      </div>
    </div>
  );
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className='container mx-auto px-4 py-8'>
      <Suspense
        fallback={
          <div className='flex items-center justify-center py-12'>
            <div className='flex flex-col items-center gap-4'>
              <Spinner size='lg' />
              <p className='text-sm text-muted-foreground'>
                Loading course details...
              </p>
            </div>
          </div>
        }
      >
        <CourseDetail courseId={id} />
      </Suspense>
    </div>
  );
}
