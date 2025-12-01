'use client'

import { addPet } from '../actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PetForm } from '@/components/pets/pet-form'

export default function NewPetPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-2 border-primary/20 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary text-center">Add a New Pet</CardTitle>
        </CardHeader>
        <CardContent>
          <PetForm 
            action={addPet} 
            submitLabel="Add Pet" 
            loadingLabel="Adding Pet..." 
          />
        </CardContent>
      </Card>
    </div>
  )
}
