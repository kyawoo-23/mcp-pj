import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { updatePet } from '../../actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PetForm } from '@/components/pets/pet-form'
import { DeletePetButton } from '@/components/pets/delete-pet-button'

export default async function EditPetPage({ params }: { params: Promise<{ id: string }> }) {
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
    <div className="max-w-2xl mx-auto">
      <Card className="border-2 border-primary/20 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary text-center">Edit {pet.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <PetForm 
            initialData={{
              ...pet,
              breed: pet.breed || '',
              notes: pet.notes || '',
              size: pet.size || 'medium',
            }} 
            action={updatePet} 
            submitLabel="Update Pet" 
            loadingLabel="Updating Pet..." 
          />
          
          <div className="mt-8 pt-6 border-t border-border">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-destructive">Danger Zone</h3>
                <p className="text-sm text-muted-foreground">Deleting a pet is irreversible.</p>
              </div>
              <DeletePetButton id={pet.id} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
