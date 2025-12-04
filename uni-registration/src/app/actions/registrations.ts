"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getUserRegistrations() {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { data: null, error: "Not authenticated" };
  }

  const { data, error } = await supabase
    .from("student_registrations")
    .select(`
      *,
      course_sections (
        *,
        courses (*)
      ),
      profiles (*)
    `)
    .eq("student_id", user.id)
    .order("registered_at", { ascending: false });

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data || [], error: null };
}

export async function registerForSection(sectionId: string) {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Not authenticated" };
  }

  // Check if already registered
  const { data: existingRegistration } = await supabase
    .from("student_registrations")
    .select("*")
    .eq("student_id", user.id)
    .eq("section_id", sectionId)
    .in("status", ["active", "waitlisted"])
    .single();

  if (existingRegistration) {
    return {
      success: false,
      error: "You are already registered for this section",
    };
  }

  // Get section details to check capacity
  const { data: section, error: sectionError } = await supabase
    .from("course_sections")
    .select("*")
    .eq("id", sectionId)
    .single();

  if (sectionError || !section) {
    return { success: false, error: "Section not found" };
  }

  // Check capacity
  if (section.enrolled_count >= section.capacity) {
    // Add to waitlist
    const { error: insertError } = await supabase
      .from("student_registrations")
      .insert({
        student_id: user.id,
        section_id: sectionId,
        status: "waitlisted",
        registered_at: new Date().toISOString(),
      });

    if (insertError) {
      return { success: false, error: insertError.message };
    }

    revalidatePath("/registrations");
    revalidatePath("/courses");
    return {
      success: true,
      message: "Added to waitlist (section is full)",
    };
  }

  // Register for section
  const { error: insertError } = await supabase
    .from("student_registrations")
    .insert({
      student_id: user.id,
      section_id: sectionId,
      status: "active",
      registered_at: new Date().toISOString(),
    });

  if (insertError) {
    return { success: false, error: insertError.message };
  }

  // Update enrolled count
  await supabase
    .from("course_sections")
    .update({ enrolled_count: section.enrolled_count + 1 })
    .eq("id", sectionId);

  revalidatePath("/registrations");
  revalidatePath("/courses");
  return { success: true, message: "Successfully registered for section" };
}

export async function dropRegistration(registrationId: string) {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Not authenticated" };
  }

  // Get registration to verify ownership and get section_id
  const { data: registration, error: getError } = await supabase
    .from("student_registrations")
    .select("*, course_sections (*)")
    .eq("id", registrationId)
    .eq("student_id", user.id)
    .single();

  if (getError || !registration) {
    return { success: false, error: "Registration not found" };
  }

  // Update registration status to dropped
  const { error: updateError } = await supabase
    .from("student_registrations")
    .update({
      status: "dropped",
      dropped_at: new Date().toISOString(),
    })
    .eq("id", registrationId);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  // Decrease enrolled count if status was active
  if (registration.status === "active") {
    const section = registration.course_sections as any;
    if (section && section.enrolled_count > 0) {
      await supabase
        .from("course_sections")
        .update({ enrolled_count: section.enrolled_count - 1 })
        .eq("id", section.id);
    }
  }

  revalidatePath("/registrations");
  revalidatePath("/courses");
  return { success: true, message: "Successfully dropped course" };
}

export async function getSectionAvailability(sectionId: string) {
  const supabase = await createClient();

  const { data: section, error } = await supabase
    .from("course_sections")
    .select("*")
    .eq("id", sectionId)
    .single();

  if (error || !section) {
    return { available: false, capacity: 0, enrolled: 0 };
  }

  const available = section.capacity - section.enrolled_count;
  return {
    available: available > 0,
    capacity: section.capacity,
    enrolled: section.enrolled_count,
    spotsLeft: available,
  };
}

