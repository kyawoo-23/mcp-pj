import { getFacilities } from "@/app/actions/facilities";
import { BookingForm } from "@/components/bookings/booking-form";
import { Card, CardContent } from "@/components/ui/card";

interface BookingNewPageProps {
  searchParams: Promise<{ facility_id?: string }>;
}

export default async function BookingNewPage({ searchParams }: BookingNewPageProps) {
  const params = await searchParams;
  const { data: facilities } = await getFacilities({ is_active: true });

  if (!facilities || facilities.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No facilities available for booking.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">New Booking</h1>
        <p className="text-muted-foreground mt-2">
          Create a new facility booking
        </p>
      </div>

      <div className="max-w-2xl">
        <BookingForm
          facilities={facilities}
          preSelectedFacilityId={params.facility_id}
        />
      </div>
    </div>
  );
}

