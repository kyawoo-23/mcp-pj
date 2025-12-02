import { Database } from "../../../supabase/types/database.types";

// Database table types
export type Facility = Database["public"]["Tables"]["facilities"]["Row"];
export type FacilityInsert = Database["public"]["Tables"]["facilities"]["Insert"];
export type FacilityUpdate = Database["public"]["Tables"]["facilities"]["Update"];

export type FacilityBooking = Database["public"]["Tables"]["facility_bookings"]["Row"];
export type FacilityBookingInsert = Database["public"]["Tables"]["facility_bookings"]["Insert"];
export type FacilityBookingUpdate = Database["public"]["Tables"]["facility_bookings"]["Update"];

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

// Enums
export type BookingStatus = Database["public"]["Enums"]["booking_status"];
export type FacilityType = Database["public"]["Enums"]["facility_type"];
export type UserRole = Database["public"]["Enums"]["user_role"];

// Extended types with relations
export type FacilityWithBookings = Facility & {
  facility_bookings?: FacilityBooking[];
};

export type FacilityBookingWithFacility = FacilityBooking & {
  facilities?: Facility;
};

export type FacilityBookingWithDetails = FacilityBooking & {
  facilities: Facility;
  profiles?: Profile;
};

// Form types
export interface BookingFormData {
  facility_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  purpose?: string;
}

export interface FacilityFilters {
  search?: string;
  facility_type?: FacilityType;
  building?: string;
  is_active?: boolean;
}

export interface AvailabilityCheck {
  facility_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  exclude_booking_id?: string;
}

