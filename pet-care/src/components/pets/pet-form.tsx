'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

type PetFormData = {
  name: string
  type: "dog" | "cat" | "other"
  breed: string
  size: "small" | "medium" | "large"
  notes: string
}

interface PetFormProps {
  initialData?: PetFormData & { id?: string }
  action: (formData: FormData) => Promise<{ error?: string; success?: boolean }>
  submitLabel: string
  loadingLabel: string
}

export function PetForm({ initialData, action, submitLabel, loadingLabel }: PetFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    
    // If we have an ID (edit mode), append it to the form data
    if (initialData?.id) {
      formData.append('id', initialData.id)
    }

    const result = await action(formData)

    if (result.error) {
      toast.error(result.error)
      setIsLoading(false)
    } else {
      toast.success(initialData ? 'Pet updated successfully!' : 'Pet added successfully!')
      router.push(initialData?.id ? `/pets/${initialData.id}` : '/pets')
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Pet Name</Label>
          <Input 
            id="name" 
            name="name" 
            defaultValue={initialData?.name} 
            placeholder="Buddy" 
            required 
            className="rounded-xl" 
            disabled={isLoading} 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Select name="type" defaultValue={initialData?.type} required disabled={isLoading}>
            <SelectTrigger id="type" className="rounded-xl">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dog">Dog</SelectItem>
              <SelectItem value="cat">Cat</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="breed">Breed</Label>
          <Input 
            id="breed" 
            name="breed" 
            defaultValue={initialData?.breed} 
            placeholder="Golden Retriever" 
            className="rounded-xl" 
            disabled={isLoading} 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="size">Size</Label>
          <Select name="size" defaultValue={initialData?.size} disabled={isLoading}>
            <SelectTrigger id="size" className="rounded-xl">
              <SelectValue placeholder="Select size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Small</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="large">Large</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea 
          id="notes" 
          name="notes" 
          defaultValue={initialData?.notes}
          className="rounded-xl min-h-[80px]"
          placeholder="Any special needs or personality traits?"
          disabled={isLoading}
        />
      </div>

      <Button type="submit" className="w-full rounded-xl text-lg font-medium" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {loadingLabel}
          </>
        ) : (
          submitLabel
        )}
      </Button>
    </form>
  )
}
