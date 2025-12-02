"use server";

import { createClient } from "@/lib/supabase/server";
import type { FacilityFilters, FacilityBooking } from "@/lib/types";

export async function getFacilities(filters?: FacilityFilters) {
  const supabase = await createClient();

  let query = supabase
    .from("facilities")
    .select("*")
    .order("name");

  if (filters?.is_active !== undefined) {
    query = query.eq("is_active", filters.is_active);
  } else {
    // Default to only active facilities
    query = query.eq("is_active", true);
  }

  if (filters?.facility_type) {
    query = query.eq("facility_type", filters.facility_type);
  }

  if (filters?.building) {
    query = query.eq("building", filters.building);
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
      (facility) =>
        facility.name.toLowerCase().includes(searchLower) ||
        facility.building?.toLowerCase().includes(searchLower) ||
        facility.room_number?.toLowerCase().includes(searchLower) ||
        facility.description?.toLowerCase().includes(searchLower)
    );
  }

  return { data: filteredData, error: null };
}

export async function getFacilityAvailability(
  facilityId: string,
  bookingDate: string
): Promise<FacilityBooking[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("facility_bookings")
    .select("*")
    .eq("facility_id", facilityId)
    .eq("booking_date", bookingDate)
    .in("status", ["pending", "confirmed"]);

  if (error) {
    console.error("Error fetching availability:", error);
    return [];
  }

  return data || [];
}

export async function getFacilityById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("facilities")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

