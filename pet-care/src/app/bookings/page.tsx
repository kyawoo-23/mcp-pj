import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Clock, Scissors } from 'lucide-react'
import { format } from 'date-fns'

export default async function BookingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: bookings } = await supabase
    .from('grooming_bookings')
    .select(`
      *,
      pets (
        name,
        type
      ),
      grooming_services (
        name,
        duration_minutes
      )
    `)
    .eq('customer_id', user.id)
    .order('scheduled_at', { ascending: true })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">My Bookings</h1>
      </div>

      {bookings?.length === 0 ? (
        <Card className="border-2 border-dashed border-primary/20 p-8 text-center bg-secondary/10">
          <div className="flex flex-col items-center gap-4">
            <Calendar className="h-12 w-12 text-primary/40" />
            <h3 className="text-xl font-semibold text-primary">No bookings yet</h3>
            <p className="text-muted-foreground">You haven't booked any grooming sessions yet.</p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {bookings?.map((booking) => (
            <Card key={booking.id} className="border-2 border-primary/10 hover:border-primary/30 transition-all hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-bold text-primary">
                    {booking.pets?.name}
                  </CardTitle>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize
                    ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                      booking.status === 'completed' ? 'bg-blue-100 text-blue-700' : 
                      'bg-gray-100 text-gray-700'}`}>
                    {booking.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground capitalize">{booking.pets?.type}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <div className="bg-secondary/20 p-2 rounded-lg">
                    <Scissors className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{booking.grooming_services?.name}</p>
                    <p className="text-muted-foreground text-xs">{booking.grooming_services?.duration_minutes} mins</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <div className="bg-secondary/20 p-2 rounded-lg">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{format(new Date(booking.scheduled_at), 'MMMM d, yyyy')}</p>
                    <p className="text-muted-foreground text-xs">{format(new Date(booking.scheduled_at), 'h:mm a')}</p>
                  </div>
                </div>

                {booking.notes && (
                  <div className="bg-muted/30 p-3 rounded-xl text-sm italic text-muted-foreground">
                    "{booking.notes}"
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
