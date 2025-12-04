"use server";

import { createClient } from "@/lib/supabase/server";
import type { CourseFilters } from "@/lib/types";

export async function getCourses(filters?: CourseFilters) {
  const supabase = await createClient();

  let query = supabase
    .from("courses")
    .select("*")
    .order("code");

  if (filters?.department) {
    query = query.eq("department", filters.department);
  }

  const { data, error } = await query;

  if (error) {
    return { data: null, error: error.message };
  }

  // Apply search filter client-side if provided
  let filteredData = data || [];
  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    filteredData = filteredData.filter(
      (course) =>
        course.code.toLowerCase().includes(searchLower) ||
        course.title.toLowerCase().includes(searchLower) ||
        course.description?.toLowerCase().includes(searchLower) ||
        course.department?.toLowerCase().includes(searchLower)
    );
  }

  return { data: filteredData, error: null };
}

export async function getCourseById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function getCourseSections(
  courseId: string,
  semester?: string,
  year?: number
) {
  const supabase = await createClient();

  let query = supabase
    .from("course_sections")
    .select("*")
    .eq("course_id", courseId)
    .order("section_number");

  if (semester) {
    query = query.eq("semester", semester);
  }

  if (year) {
    query = query.eq("year", year);
  }

  const { data, error } = await query;

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data || [], error: null };
}

export async function getSectionById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("course_sections")
    .select(`
      *,
      courses (*)
    `)
    .eq("id", id)
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

