import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Building2, Calendar, Search, Clock } from "lucide-react";
import { HeroButtons } from "@/components/home/hero-buttons";

export default function Home() {
  return (
    <div className='container mx-auto px-4 py-16'>
      <div className='mx-auto max-w-4xl text-center'>
        <h1 className='text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl'>
          University Facility Booking
        </h1>
        <p className='mt-6 text-lg leading-8 text-muted-foreground'>
          Easily browse, book, and manage university facilities. Find the
          perfect space for your study sessions, meetings, or events.
        </p>
        <HeroButtons />
      </div>

      <div className='mt-20 grid gap-8 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader>
            <Building2 className='mb-2 h-8 w-8 text-primary' />
            <CardTitle>Browse Facilities</CardTitle>
            <CardDescription>
              Explore available study rooms, labs, meeting rooms, and more
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <Search className='mb-2 h-8 w-8 text-primary' />
            <CardTitle>Search & Filter</CardTitle>
            <CardDescription>
              Find facilities by type, building, or availability
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <Calendar className='mb-2 h-8 w-8 text-primary' />
            <CardTitle>Easy Booking</CardTitle>
            <CardDescription>
              Book facilities with real-time availability checking
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <Clock className='mb-2 h-8 w-8 text-primary' />
            <CardTitle>Manage Bookings</CardTitle>
            <CardDescription>
              View, edit, or cancel your bookings anytime
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
