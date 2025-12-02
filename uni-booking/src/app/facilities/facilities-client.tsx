"use client";

import { useState, useMemo } from "react";
import { FacilityCard } from "@/components/facilities/facility-card";
import { FacilityFilters } from "@/components/facilities/facility-filters";
import type { Facility, FacilityType } from "@/lib/types";

interface FacilitiesClientProps {
  initialFacilities: Facility[];
  buildings: string[];
  facilityTypes: FacilityType[];
}

export default function FacilitiesClient({
  initialFacilities,
  buildings,
  facilityTypes,
}: FacilitiesClientProps) {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<FacilityType | "all">("all");
  const [selectedBuilding, setSelectedBuilding] = useState<string | "all">("all");

  const filteredFacilities = useMemo(() => {
    return initialFacilities.filter((facility) => {
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesSearch =
          facility.name.toLowerCase().includes(searchLower) ||
          facility.building?.toLowerCase().includes(searchLower) ||
          facility.room_number?.toLowerCase().includes(searchLower) ||
          facility.description?.toLowerCase().includes(searchLower);

        if (!matchesSearch) return false;
      }

      // Type filter
      if (selectedType !== "all" && facility.facility_type !== selectedType) {
        return false;
      }

      // Building filter
      if (selectedBuilding !== "all" && facility.building !== selectedBuilding) {
        return false;
      }

      return true;
    });
  }, [initialFacilities, search, selectedType, selectedBuilding]);

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
      <div className="lg:sticky lg:top-4 lg:h-fit">
        <FacilityFilters
          onSearchChange={setSearch}
          onTypeChange={setSelectedType}
          onBuildingChange={setSelectedBuilding}
          buildings={buildings}
          facilityTypes={facilityTypes}
        />
      </div>

      <div>
        <div className="mb-4 text-sm text-muted-foreground">
          Showing {filteredFacilities.length} of {initialFacilities.length} facilities
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredFacilities.map((facility) => (
            <FacilityCard key={facility.id} facility={facility} />
          ))}
        </div>
        {filteredFacilities.length === 0 && (
          <div className="py-10 text-center text-muted-foreground">
            No facilities match your filters.
          </div>
        )}
      </div>
    </div>
  );
}

