"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { recordTaskCompletion } from "@/lib/task-mode-server";

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
      errorCode: "ALREADY_REGISTERED",
      error: "You're already registered for this section.",
    };
  }



  // Register for section
  const { data: registration, error: insertError } = await supabase
    .from("student_registrations")
    .insert({
      student_id: user.id,
      section_id: sectionId,
      status: "active",
      registered_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (insertError) {
    return { success: false, error: insertError.message };
  }



  // Check task assignment criteria
  const { data: assignment } = await supabase
    .from("task_user_assignments")
    .select(`
      task_assignment_sets (
        targets
      )
    `)
    .eq("user_id", user.id)
    .maybeSingle();

  let isTargetMatch = true;

  const taskAssignmentSets = assignment?.task_assignment_sets as any;
  if (taskAssignmentSets?.targets) {
    const targets = taskAssignmentSets.targets as Record<string, { title: string; description: string; criteria: Record<string, string> }>;
    const criteria = targets.register_course?.criteria;
    
    if (criteria) {
      const { data: sectionData } = await supabase
        .from("course_sections")
        .select("section_number, courses(code)")
        .eq("id", sectionId)
        .single();
        
      if (sectionData) {
        const courseCode = (sectionData.courses as unknown as { code: string })?.code;
        const sectionNumber = sectionData.section_number;
        
        isTargetMatch = 
          (!criteria.course_code || criteria.course_code === courseCode) &&
          (!criteria.section_number || criteria.section_number === sectionNumber);
      } else {
        isTargetMatch = false;
      }
    }
  }

  if (isTargetMatch) {
    await recordTaskCompletion(supabase, {
      userId: user.id,
      systemType: "traditional",
      taskCode: "register_course",
      successPayload: {
        section_id: sectionId,
        registration_id: registration?.id ?? null,
      },
    });
  }

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
  const { data: updatedRegistration, error: updateError } = await supabase
    .from("student_registrations")
    .update({
      status: "dropped",
      dropped_at: new Date().toISOString(),
    })
    .eq("id", registrationId)
    .select()
    .single();

  if (updateError) {
    return { success: false, error: updateError.message };
  }



  // Check task assignment criteria
  const { data: assignment } = await supabase
    .from("task_user_assignments")
    .select(`
      task_assignment_sets (
        targets
      )
    `)
    .eq("user_id", user.id)
    .maybeSingle();

  let isTargetMatch = true;

  const taskAssignmentSets = assignment?.task_assignment_sets as any;
  if (taskAssignmentSets?.targets) {
    const targets = taskAssignmentSets.targets as Record<string, { title: string; description: string; criteria: Record<string, string> }>;
    const criteria = targets.drop_course?.criteria;
    
    if (criteria) {
      const { data: sectionData } = await supabase
        .from("course_sections")
        .select("courses(code)")
        .eq("id", registration.section_id)
        .single();
        
      if (sectionData) {
        const courseCode = (sectionData.courses as unknown as { code: string })?.code;
        isTargetMatch = !criteria.course_code || criteria.course_code === courseCode;
      } else {
        isTargetMatch = false;
      }
    }
  }

  if (isTargetMatch) {
    await recordTaskCompletion(supabase, {
      userId: user.id,
      systemType: "traditional",
      taskCode: "drop_course",
      successPayload: {
        registration_id: registrationId,
        section_id: registration.section_id ?? null,
        dropped_id: updatedRegistration?.id ?? null,
      },
    });
  }

  revalidatePath("/registrations");
  revalidatePath("/courses");
  return { success: true, message: "Successfully dropped course" };
}

