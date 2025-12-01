'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function addPet(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const name = formData.get('name') as string
  const type = formData.get('type') as "dog" | "cat" | "other"
  const breed = formData.get('breed') as string
  const size = formData.get('size') as "small" | "medium" | "large"
  const notes = formData.get('notes') as string

  const { error } = await supabase.from('pets').insert({
    owner_id: user.id,
    name,
    type,
    breed: breed || null,
    size: size || null,
    notes: notes || null,
  })

  if (error) {
    console.error("Error in addPet: " + JSON.stringify(error, null, 2))
    return { error: 'Could not add pet' }
  }

  revalidatePath('/pets')
  return { success: true }
}

export async function updatePet(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const type = formData.get('type') as "dog" | "cat" | "other"
  const breed = formData.get('breed') as string
  const size = formData.get('size') as "small" | "medium" | "large"
  const notes = formData.get('notes') as string

  const { error } = await supabase
    .from('pets')
    .update({
      name,
      type,
      breed: breed || null,
      size: size || null,
      notes: notes || null,
    })
    .eq('id', id)
    .eq('owner_id', user.id)

  if (error) {
    console.error("Error in updatePet: " + JSON.stringify(error, null, 2))
    return { error: 'Could not update pet' }
  }

  revalidatePath(`/pets/${id}`)
  revalidatePath('/pets')
  return { success: true }
}

export async function deletePet(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { error } = await supabase
    .from('pets')
    .delete()
    .eq('id', id)
    .eq('owner_id', user.id)

  if (error) {
    console.error("Error in deletePet: " + JSON.stringify(error, null, 2))
    return { error: 'Could not delete pet' }
  }

  revalidatePath('/pets')
  return { success: true }
}
