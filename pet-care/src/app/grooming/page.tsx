import { createClient } from '@/utils/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Scissors, Clock, DollarSign } from 'lucide-react'

export default async function GroomingPage({ searchParams }: { searchParams: Promise<{ success?: string }> }) {
  const { success } = await searchParams
  const supabase = await createClient()
  
  const { data: services } = await supabase
    .from('grooming_services')
    .select('*')
    .eq('is_active', true)
    .order('base_price', { ascending: true })

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-primary">Pamper Your Pet</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          Choose from our selection of premium grooming services designed to make your furry friend look and feel their best.
        </p>
        {success && (
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded-xl inline-block font-medium border border-green-200">
            {success}
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {services?.map((service) => (
          <Card key={service.id} className="flex flex-col border-2 border-primary/10 hover:border-primary/30 transition-all hover:shadow-lg hover:-translate-y-1">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-primary">{service.name}</CardTitle>
              <CardDescription className="text-base">{service.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-5 w-5 text-secondary-foreground" />
                <span>{service.duration_minutes} mins</span>
              </div>
              <div className="flex items-center gap-2 text-xl font-bold text-primary">
                <DollarSign className="h-6 w-6" />
                <span>{service.base_price}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full rounded-xl text-lg" asChild>
                <Link href={`/grooming/book?serviceId=${service.id}`}>Book Now</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
