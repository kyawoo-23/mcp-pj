'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error("Error in login: " + JSON.stringify(error, null, 2))
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: 'customer', // Default role
      },
    },
  })

  if (error) {
    console.error("Error in signup: " + JSON.stringify(error, null, 2))
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}
