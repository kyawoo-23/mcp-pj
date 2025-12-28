
import { createClient } from "@/lib/supabase/server";

export async function getUniqueDepartments(): Promise<string[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("courses")
    .select("department")
    .not("department", "is", null);

  if (error) {
    console.error("Error fetching departments:", error);
    return [];
  }

  // Extract unique departments and filter out any potential nulls/undefined if types slip through
  const departments = Array.from(new Set(data.map((d) => d.department))).filter((d): d is string => !!d);
  
  return departments.sort();
}
