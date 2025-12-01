'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function bookGrooming(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const serviceId = formData.get('serviceId') as string
  const petId = formData.get('petId') as string
  const date = formData.get('date') as string
  const time = formData.get('time') as string
  const notes = formData.get('notes') as string
  const price = formData.get('price') as string

  const scheduledAt = new Date(`${date}T${time}`).toISOString()

  const { error } = await supabase.from('grooming_bookings').insert({
    customer_id: user.id,
    service_id: serviceId,
    pet_id: petId,
    scheduled_at: scheduledAt,
    total_price: parseFloat(price),
    status: 'pending',
    notes: notes || null,
  })

  if (error) {
    console.error("Error in bookGrooming: " + JSON.stringify(error, null, 2))
    return { error: 'Could not book appointment' }
  }

  revalidatePath('/grooming')
  return { success: true }
}
