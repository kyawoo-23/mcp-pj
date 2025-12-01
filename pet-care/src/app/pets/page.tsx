import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Plus, PawPrint } from 'lucide-react'

export default async function PetsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: pets } = await supabase
    .from('pets')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
          My Pets
        </h1>
        <Button asChild className="rounded-full shadow-md hover:shadow-lg transition-all">
          <Link href="/pets/new">
            <Plus className="mr-2 h-4 w-4" /> Add Pet
          </Link>
        </Button>
      </div>

      {pets && pets.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pets.map((pet) => (
            <Card key={pet.id} className="overflow-hidden border-2 border-primary/10 hover:border-primary/30 transition-all hover:shadow-md group">
              <CardHeader className="bg-secondary/30 pt-2 pb-4">
                <CardTitle className="flex items-center justify-between">
                  <span className="text-xl font-bold text-primary">{pet.name}</span>
                  <span className="text-xs px-2 py-1 bg-white rounded-full text-muted-foreground uppercase border border-border">
                    {pet.type}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Breed:</span>
                  <span className="font-medium">{pet.breed || 'Unknown'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Size:</span>
                  <span className="font-medium capitalize">{pet.size || 'Unknown'}</span>
                </div>
                {pet.notes && (
                  <div className="mt-2 text-sm text-muted-foreground bg-muted/50 p-2 rounded-lg italic">
                    "{pet.notes}"
                  </div>
                )}
              </CardContent>
              <CardFooter className="bg-muted/20 pt-4">
                 <Button variant="outline" size="sm" className="w-full rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors" asChild>
                    <Link href={`/pets/${pet.id}`}>View Details</Link>
                 </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-muted/30 rounded-3xl border-2 border-dashed border-muted-foreground/20">
          <div className="bg-white p-4 rounded-full inline-block mb-4 shadow-sm">
             <PawPrint className="h-12 w-12 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-medium text-muted-foreground">No pets found</h3>
          <p className="text-sm text-muted-foreground mb-6">Add your first pet to get started!</p>
          <Button asChild variant="secondary">
            <Link href="/pets/new">Add Your First Pet</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
