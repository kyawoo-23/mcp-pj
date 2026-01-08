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
import { Building2 } from "lucide-react";
import type { Facility } from "@/lib/types";

interface FacilityCardProps {
  facility: Facility;
}

export function FacilityCard({ facility }: FacilityCardProps) {
  return (
    <Card className='flex flex-col'>
      <CardHeader>
        <div className='flex items-start justify-between'>
          <div className='space-y-1'>
            <CardTitle className='text-lg'>{facility.name}</CardTitle>
            <CardDescription className='flex items-center gap-2'>
              <Building2 className='h-4 w-4' />
              {facility.building}
              {facility.room_number && ` - Room ${facility.room_number}`}
            </CardDescription>
          </div>
          <Badge variant={facility.is_active ? "default" : "secondary"}>
            {facility.is_active ? "Available" : "Unavailable"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className='flex-1 space-y-4'>
        <div className='space-y-2'>
          {facility.description && (
            <p className='text-sm text-muted-foreground line-clamp-2'>
              {facility.description}
            </p>
          )}
          {facility.amenities && facility.amenities.length > 0 && (
            <div className='flex flex-wrap gap-1'>
              {facility.amenities.map((amenity, index) => (
                <Badge key={index} variant='outline' className='text-xs'>
                  {amenity}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <div className='pt-2'>
          <Link href={`/bookings/new?facility_id=${facility.id}`}>
            <Button className='w-full' disabled={!facility.is_active}>
              {facility.is_active ? "Book Now" : "Unavailable"}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
