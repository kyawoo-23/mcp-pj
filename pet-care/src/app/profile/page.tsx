import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { ProfileForm } from '@/components/profile/profile-form'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const initialData = {
    full_name: profile?.full_name || user.user_metadata?.full_name || '',
  }

  return (
    <div className="container max-w-2xl mx-auto py-8">
      <h1 className="text-3xl text-center text-primary font-bold mb-8">My Profile</h1>
      <ProfileForm initialData={initialData} />
    </div>
  )
}
