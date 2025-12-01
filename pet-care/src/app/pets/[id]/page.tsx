import { createClient } from '@/utils/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowLeft, PawPrint } from 'lucide-react'
import { notFound } from 'next/navigation'

export default async function PetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: pet, error } = await supabase
    .from('pets')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !pet) {
    notFound()
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button variant="ghost" asChild className="pl-0 hover:pl-2 transition-all">
        <Link href="/pets">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Pets
        </Link>
      </Button>

      <Card className="border-2 border-primary/20 shadow-lg overflow-hidden">
        <div className="h-32 bg-secondary/30 flex items-center justify-center">
           <PawPrint className="h-16 w-16 text-primary/40" />
        </div>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
               <CardTitle className="text-3xl font-bold text-primary">{pet.name}</CardTitle>
               <p className="text-muted-foreground capitalize mt-1">{pet.type} • {pet.breed || 'Unknown Breed'}</p>
            </div>
            <div className="bg-primary/10 px-3 py-1 rounded-full text-sm font-medium text-primary capitalize border border-primary/20">
              {pet.size} Size
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
             <div className="bg-muted/30 p-3 rounded-xl">
                <span className="block text-muted-foreground text-xs uppercase tracking-wider mb-1">Created</span>
                <span className="font-medium">{new Date(pet.created_at).toLocaleDateString()}</span>
             </div>
             <div className="bg-muted/30 p-3 rounded-xl">
                <span className="block text-muted-foreground text-xs uppercase tracking-wider mb-1">Status</span>
                <span className="font-medium text-green-600">Active</span>
             </div>
          </div>

          {pet.notes && (
            <div className="bg-secondary/20 p-4 rounded-xl border border-secondary/30">
              <h4 className="font-medium text-primary mb-2 flex items-center gap-2">
                 Notes
              </h4>
              <p className="text-sm text-muted-foreground italic">
                "{pet.notes}"
              </p>
            </div>
          )}
          
          <div className="pt-4 flex gap-3">
             <Button className="flex-1 rounded-xl" asChild>
                <Link href={`/grooming/book?petId=${pet.id}`}>Book Grooming</Link>
             </Button>
             <Button variant="outline" className="flex-1 rounded-xl" asChild>
                <Link href={`/pets/${pet.id}/edit`}>Edit Details</Link>
             </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
