import { createClient } from '@/utils/supabase/server'
import { BookingForm } from './booking-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { redirect } from 'next/navigation'

export default async function BookingPage({ searchParams }: { searchParams: Promise<{ serviceId?: string; petId?: string }> }) {
  const { serviceId, petId } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?next=/grooming/book')
  }

  const { data: pets } = await supabase
    .from('pets')
    .select('*')
    .eq('owner_id', user.id)

  const { data: services } = await supabase
    .from('grooming_services')
    .select('*')
    .eq('is_active', true)

  const selectedService = services?.find(s => s.id === serviceId)

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-2 border-primary/20 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary text-center">Book Appointment</CardTitle>
        </CardHeader>
        <CardContent>
          <BookingForm 
            services={services} 
            pets={pets} 
            defaultServiceId={serviceId} 
            defaultPetId={petId} 
          />
        </CardContent>
      </Card>
    </div>
  )
}
