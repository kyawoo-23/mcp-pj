"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type {
  FacilityBookingInsert,
  BookingFormData,
} from "@/lib/types";
import { hasTimeConflict, validateTimeRange } from "@/lib/utils/booking";
import { getFacilityAvailability } from "./facilities";
import { recordTaskCompletion } from "@/lib/task-mode-server";

export async function createBooking(formData: BookingFormData) {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { data: null, error: "Authentication required" };
  }

  // Get user profile to get student_id
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return { data: null, error: "User profile not found" };
  }

  // Validate time range
  const timeValidation = validateTimeRange(formData.start_time, formData.end_time);
  if (!timeValidation.valid) {
    return { data: null, error: timeValidation.error };
  }

  // Check for conflicts
  const existingBookings = await getFacilityAvailability(
    formData.facility_id,
    formData.booking_date
  );

  if (
    hasTimeConflict(
      {
        facility_id: formData.facility_id,
        booking_date: formData.booking_date,
        start_time: formData.start_time,
        end_time: formData.end_time,
      },
      existingBookings
    )
  ) {
    return { data: null, error: "This time slot conflicts with an existing booking" };
  }

  // Combine date and time into timestamps
  const startTimestamp = `${formData.booking_date}T${formData.start_time}:00`;
  const endTimestamp = `${formData.booking_date}T${formData.end_time}:00`;

  // Create booking
  const bookingData: FacilityBookingInsert = {
    facility_id: formData.facility_id,
    booking_date: formData.booking_date,
    start_time: startTimestamp,
    end_time: endTimestamp,
    purpose: formData.purpose || null,
    student_id: profile.id,
    status: "pending",
  };

  const { data, error } = await supabase
    .from("facility_bookings")
    .insert(bookingData)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  const taskResult = await recordTaskCompletion(supabase, {
    userId: user.id,
    systemType: "uni-booking",
    taskCode: "book_room",
    successPayload: {
      booking_id: data?.id ?? null,
      facility_id: formData.facility_id,
      booking_date: formData.booking_date,
    },
  });

  revalidatePath("/bookings");
  revalidatePath("/facilities");

  return { data, error: null, taskCompleted: !taskResult.skipped };
}

export async function getUserBookings() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { data: null, error: "Authentication required" };
  }

  const { data, error } = await supabase
    .from("facility_bookings")
    .select(
      `
      *,
      facilities (*)
    `
    )
    .eq("student_id", user.id)
    .order("booking_date", { ascending: false })
    .order("start_time", { ascending: false });

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function getBookingById(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { data: null, error: "Authentication required" };
  }

  const { data, error } = await supabase
    .from("facility_bookings")
    .select(
      `
      *,
      facilities (*)
    `
    )
    .eq("id", id)
    .eq("student_id", user.id)
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function cancelBooking(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { data: null, error: "Authentication required" };
  }

  // Get existing booking
  const { data: existingBooking, error: fetchError } = await supabase
    .from("facility_bookings")
    .select("*")
    .eq("id", id)
    .eq("student_id", user.id)
    .single();

  if (fetchError || !existingBooking) {
    return { data: null, error: "Booking not found" };
  }

  // Check if booking can be cancelled
  if (existingBooking.status === "cancelled" || existingBooking.status === "completed") {
    return { data: null, error: "This booking cannot be cancelled" };
  }

  // Update status to cancelled
  const { data, error } = await supabase
    .from("facility_bookings")
    .update({ status: "cancelled" })
    .eq("id", id)
    .eq("student_id", user.id)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  const taskResult = await recordTaskCompletion(supabase, {
    userId: user.id,
    systemType: "uni-booking",
    taskCode: "cancel_booking",
    successPayload: {
      booking_id: data?.id ?? null,
      facility_id: data?.facility_id ?? null,
    },
  });

  revalidatePath("/bookings");
  revalidatePath(`/bookings/${id}`);

  return { data, error: null, taskCompleted: !taskResult.skipped };
}

