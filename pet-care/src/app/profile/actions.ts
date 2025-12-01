'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { z } from 'zod'

const profileSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
})

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const rawData = {
    full_name: formData.get('full_name'),
  }

  const validatedFields = profileSchema.safeParse(rawData)

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors.full_name?.[0] || 'Invalid data' }
  }

  const { full_name } = validatedFields.data

  const { error } = await supabase
    .from('profiles')
    .update({ full_name })
    .eq('id', user.id)

  if (error) {
    console.error("Error updating profile:", error)
    return { error: 'Failed to update profile' }
  }

  revalidatePath('/profile')
  return { success: true }
}
