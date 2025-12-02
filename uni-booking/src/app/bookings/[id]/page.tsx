import { notFound, redirect } from "next/navigation";
import { getBookingById, updateBooking } from "@/app/actions/bookings";
import { getFacilities } from "@/app/actions/facilities";
import BookingEditForm from "./booking-edit-form";

interface BookingDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function BookingDetailPage({ params }: BookingDetailPageProps) {
  const { id } = await params;
  const { data: booking, error } = await getBookingById(id);

  if (error || !booking) {
    notFound();
  }

  const { data: facilities } = await getFacilities({ is_active: true });

  if (!facilities) {
    return <div>Error loading facilities</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Booking Details</h1>
        <p className="text-muted-foreground mt-2">
          View and edit your booking
        </p>
      </div>

      <div className="max-w-2xl">
        <BookingEditForm booking={booking} facilities={facilities} />
      </div>
    </div>
  );
}

