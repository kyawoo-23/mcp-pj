import { notFound } from "next/navigation";
import { getBookingById } from "@/app/actions/bookings";
import BookingDetailView from "@/app/bookings/[id]/booking-detail-view";

interface BookingDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function BookingDetailPage({
  params,
}: BookingDetailPageProps) {
  const { id } = await params;
  const { data: booking, error } = await getBookingById(id);

  if (error || !booking) {
    notFound();
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold'>Booking Details</h1>
        <p className='text-muted-foreground mt-2'>View your booking details</p>
      </div>

      <div className='max-w-2xl'>
        <BookingDetailView booking={booking} />
      </div>
    </div>
  );
}
