"use client";

import { useState, useEffect } from "react";
import { getCourses } from "@/app/actions/courses";
import { CourseCard } from "@/components/courses/course-card";
import { CourseFiltersComponent } from "@/components/courses/course-filters";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent } from "@/components/ui/card";
import type { Course, CourseFilters } from "@/lib/types";

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<CourseFilters>({});
  const [departments, setDepartments] = useState<string[]>([]);

  useEffect(() => {
    async function loadCourses() {
      setLoading(true);
      const { data, error } = await getCourses(filters);
      if (error) {
        console.error("Error loading courses:", error);
      } else {
        setCourses(data || []);
        // Extract unique departments
        const uniqueDepartments = Array.from(
          new Set(
            (data || [])
              .map((c) => c.department)
              .filter((d): d is string => !!d)
          )
        ).sort();
        setDepartments(uniqueDepartments);
      }
      setLoading(false);
    }

    loadCourses();
  }, [filters]);

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold'>Courses</h1>
        <p className='text-muted-foreground mt-2'>
          Browse and search available courses
        </p>
      </div>

      <div className='grid gap-6 lg:grid-cols-[300px_1fr]'>
        <div className='lg:sticky lg:top-4 lg:h-fit'>
          <CourseFiltersComponent
            filters={filters}
            onFiltersChange={setFilters}
            departments={departments}
          />
        </div>

        <div>
          <div className='mb-4 text-sm text-muted-foreground'>
            Showing {courses.length} courses
          </div>

          {loading ? (
            <div className='flex items-center justify-center py-12'>
              <div className='flex flex-col items-center gap-4'>
                <Spinner size='lg' />
                <p className='text-sm text-muted-foreground'>
                  Loading courses...
                </p>
              </div>
            </div>
          ) : courses.length === 0 ? (
            <Card>
              <CardContent className='py-10 text-center text-muted-foreground'>
                No courses found. Try adjusting your filters.
              </CardContent>
            </Card>
          ) : (
            <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
