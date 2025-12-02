import { Suspense } from "react";
import { getFacilities } from "@/app/actions/facilities";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import type { FacilityType } from "@/lib/types";
import FacilitiesClient from "./facilities-client";

async function FacilitiesList() {
  const { data: facilities } = await getFacilities({ is_active: true });

  if (!facilities || facilities.length === 0) {
    return (
      <Card>
        <CardContent className='py-10 text-center text-muted-foreground'>
          No facilities available at this time.
        </CardContent>
      </Card>
    );
  }

  // Extract unique buildings and facility types
  const buildings = Array.from(
    new Set(facilities.map((f) => f.building).filter(Boolean))
  ) as string[];
  const facilityTypes = Array.from(
    new Set(facilities.map((f) => f.facility_type))
  ) as FacilityType[];

  return (
    <FacilitiesClient
      initialFacilities={facilities}
      buildings={buildings}
      facilityTypes={facilityTypes}
    />
  );
}

export default function FacilitiesPage() {
  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold'>Facilities</h1>
        <p className='text-muted-foreground mt-2'>
          Browse and book available university facilities
        </p>
      </div>

      <Suspense
        fallback={
          <div className='flex items-center justify-center py-12'>
            <div className='flex flex-col items-center gap-4'>
              <Spinner size='lg' />
              <p className='text-sm text-muted-foreground'>
                Loading facilities...
              </p>
            </div>
          </div>
        }
      >
        <FacilitiesList />
      </Suspense>
    </div>
  );
}
