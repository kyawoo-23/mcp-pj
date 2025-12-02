import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Edit, X } from "lucide-react";
import type { FacilityBookingWithDetails } from "@/lib/types";
import { formatDate, formatTimeRange } from "@/lib/utils/date";

interface BookingCardProps {
  booking: FacilityBookingWithDetails;
  onCancel?: (id: string) => void;
}

export function BookingCard({ booking, onCancel }: BookingCardProps) {
  const canEdit =
    booking.status === "pending" || booking.status === "confirmed";
  const canCancel =
    booking.status === "pending" || booking.status === "confirmed";

  const statusColors = {
    pending: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-500",
    confirmed: "bg-green-500/10 text-green-600 dark:text-green-500",
    cancelled: "bg-gray-500/10 text-gray-600 dark:text-gray-500",
    completed: "bg-blue-500/10 text-blue-600 dark:text-blue-500",
  };

  return (
    <Card>
      <CardHeader>
        <div className='flex items-start justify-between'>
          <div className='space-y-1'>
            <CardTitle>{booking.facilities.name}</CardTitle>
            <CardDescription className='flex items-center gap-2'>
              <MapPin className='h-4 w-4' />
              {booking.facilities.building}
              {booking.facilities.room_number &&
                ` - Room ${booking.facilities.room_number}`}
            </CardDescription>
          </div>
          <Badge className={statusColors[booking.status]}>
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='space-y-2'>
          <div className='flex items-center gap-2 text-sm'>
            <Calendar className='h-4 w-4 text-muted-foreground' />
            <span>{formatDate(booking.booking_date)}</span>
          </div>
          <div className='flex items-center gap-2 text-sm'>
            <Clock className='h-4 w-4 text-muted-foreground' />
            <span>{formatTimeRange(booking.start_time, booking.end_time)}</span>
          </div>
          {booking.purpose && (
            <p className='text-sm text-muted-foreground'>{booking.purpose}</p>
          )}
        </div>
        <div className='flex gap-2'>
          {!canEdit && (
            <Link href={`/bookings/${booking.id}`}>
              <Button variant='outline' size='sm'>
                View Details
              </Button>
            </Link>
          )}
          {canEdit && (
            <Link href={`/bookings/${booking.id}`}>
              <Button variant='outline' size='sm'>
                <Edit className='h-4 w-4 mr-1' />
                Edit
              </Button>
            </Link>
          )}
          {canCancel && onCancel && (
            <Button
              variant='destructive'
              size='sm'
              onClick={() => onCancel(booking.id)}
            >
              <X className='h-4 w-4 mr-1' />
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
