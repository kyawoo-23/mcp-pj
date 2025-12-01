'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { updateProfile } from '@/app/profile/actions'

const profileSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
})

type ProfileFormValues = z.infer<typeof profileSchema>

interface ProfileFormProps {
  initialData: {
    full_name: string
  }
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: initialData,
  })

  async function onSubmit(data: ProfileFormValues) {
    setIsLoading(true)
    const formData = new FormData()
    formData.append('full_name', data.full_name)

    const result = await updateProfile(formData)
    setIsLoading(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Profile updated successfully')
    }
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>
          Update your personal information.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Profile
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
