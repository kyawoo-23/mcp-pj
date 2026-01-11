"use client";
import { useState, useEffect, useMemo } from "react";
import { getFacilities } from "@/app/actions/facilities";
import { useDebounce } from "@/hooks/use-debounce";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { FacilityCard } from "@/components/facilities/facility-card";
import { FacilityFilters } from "@/components/facilities/facility-filters";
import type {
  Facility,
  FacilityType,
  FacilityFilters as IFacilityFilters,
} from "@/lib/types";

export default function FacilitiesPage() {
  const [allFacilities, setAllFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<IFacilityFilters>({
    is_active: true,
  });
  const [buildings, setBuildings] = useState<string[]>([]);
  const [facilityTypes, setFacilityTypes] = useState<FacilityType[]>([]);

  // Debounce search to avoid excessive re-renders
  const debouncedSearch = useDebounce(filters.search || "", 300);

  // Fetch all facilities once on mount
  useEffect(() => {
    async function loadFacilities() {
      setLoading(true);
      const { data, error } = await getFacilities({ is_active: true });
      if (error) {
        console.error("Error loading facilities:", error);
      } else {
        setAllFacilities(data || []);
        // Extract unique buildings and types once
        const allBuildings = Array.from(
          new Set((data || []).map((f) => f.building).filter(Boolean))
        ) as string[];
        const allTypes = Array.from(
          new Set((data || []).map((f) => f.facility_type))
        ) as FacilityType[];
        setBuildings(allBuildings);
        setFacilityTypes(allTypes);
      }
      setLoading(false);
    }

    loadFacilities();
  }, []);

  // Client-side filtering with debounced search
  const facilities = useMemo(() => {
    return allFacilities.filter((facility) => {
      // Filter by type
      if (
        filters.facility_type &&
        facility.facility_type !== filters.facility_type
      ) {
        return false;
      }
      // Filter by building
      if (filters.building && facility.building !== filters.building) {
        return false;
      }
      // Filter by search (debounced)
      if (debouncedSearch) {
        const searchLower = debouncedSearch.toLowerCase();
        const matchesSearch =
          facility.name.toLowerCase().includes(searchLower) ||
          facility.building?.toLowerCase().includes(searchLower) ||
          facility.room_number?.toLowerCase().includes(searchLower) ||
          facility.description?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }
      return true;
    });
  }, [allFacilities, filters.facility_type, filters.building, debouncedSearch]);

  const handleSearchChange = (search: string) => {
    setFilters((prev) => ({ ...prev, search }));
  };

  const handleTypeChange = (type: FacilityType | "all") => {
    setFilters((prev) => ({
      ...prev,
      facility_type: type === "all" ? undefined : type,
    }));
  };

  const handleBuildingChange = (building: string | "all") => {
    setFilters((prev) => ({
      ...prev,
      building: building === "all" ? undefined : building,
    }));
  };

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold'>Facilities</h1>
        <p className='text-muted-foreground mt-2'>
          Browse and book available university facilities
        </p>
      </div>

      <div className='grid gap-6 lg:grid-cols-[300px_1fr]'>
        <div className='lg:sticky lg:top-4 lg:h-fit'>
          <FacilityFilters
            onSearchChange={handleSearchChange}
            onTypeChange={handleTypeChange}
            onBuildingChange={handleBuildingChange}
            buildings={buildings}
            facilityTypes={facilityTypes}
          />
        </div>

        <div>
          <div className='mb-4 text-sm text-muted-foreground'>
            Showing {facilities.length} facilities
          </div>

          {loading ? (
            <div className='flex items-center justify-center py-12'>
              <div className='flex flex-col items-center gap-4'>
                <Spinner size='lg' />
                <p className='text-sm text-muted-foreground'>
                  Loading facilities...
                </p>
              </div>
            </div>
          ) : facilities.length === 0 ? (
            <Card>
              <CardContent className='py-10 text-center text-muted-foreground'>
                No facilities match your filters.
              </CardContent>
            </Card>
          ) : (
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
              {facilities.map((facility) => (
                <FacilityCard key={facility.id} facility={facility} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
