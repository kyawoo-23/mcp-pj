"use client";
import { useState, useEffect } from "react";
import { getFacilities } from "@/app/actions/facilities";
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
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<IFacilityFilters>({
    is_active: true,
  });
  const [buildings, setBuildings] = useState<string[]>([]);
  const [facilityTypes, setFacilityTypes] = useState<FacilityType[]>([]);

  useEffect(() => {
    async function loadFacilities() {
      setLoading(true);
      const { data, error } = await getFacilities(filters);
      if (error) {
        console.error("Error loading facilities:", error);
      } else {
        setFacilities(data || []);
        if (buildings.length === 0 || facilityTypes.length === 0) {
          const allBuildings = Array.from(
            new Set((data || []).map((f) => f.building).filter(Boolean))
          ) as string[];
          const allTypes = Array.from(
            new Set((data || []).map((f) => f.facility_type))
          ) as FacilityType[];

          if (buildings.length === 0) setBuildings(allBuildings);
          if (facilityTypes.length === 0) setFacilityTypes(allTypes);
        }
      }
      setLoading(false);
    }

    loadFacilities();
  }, [filters]);

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
