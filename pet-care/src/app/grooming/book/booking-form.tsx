'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { bookGrooming } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Service {
  id: string
  name: string
  base_price: number
}

interface Pet {
  id: string
  name: string
  type: string
}

interface BookingFormProps {
  services: Service[] | null
  pets: Pet[] | null
  defaultServiceId?: string
  defaultPetId?: string
}

export function BookingForm({ services, pets, defaultServiceId, defaultPetId }: BookingFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedServiceId, setSelectedServiceId] = useState(defaultServiceId)
  const router = useRouter()

  const selectedService = services?.find(s => s.id === selectedServiceId)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const result = await bookGrooming(formData)

    if (result.error) {
      toast.error(result.error)
      setIsLoading(false)
    } else {
      toast.success('Booking confirmed!')
      router.push('/grooming')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <input type="hidden" name="price" value={selectedService?.base_price || 0} />
      
      <div className="space-y-2">
        <Label htmlFor="serviceId">Service</Label>
        <Select 
          name="serviceId" 
          defaultValue={defaultServiceId} 
          onValueChange={setSelectedServiceId}
          required 
          disabled={isLoading}
        >
          <SelectTrigger id="serviceId" className="rounded-xl">
            <SelectValue placeholder="Select a service" />
          </SelectTrigger>
          <SelectContent>
            {services?.map(service => (
              <SelectItem key={service.id} value={service.id}>
                {service.name} (${service.base_price})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="petId">Pet</Label>
        <Select name="petId" defaultValue={defaultPetId} required disabled={isLoading}>
          <SelectTrigger id="petId" className="rounded-xl">
            <SelectValue placeholder="Select your pet" />
          </SelectTrigger>
          <SelectContent>
            {pets?.map(pet => (
              <SelectItem key={pet.id} value={pet.id}>
                {pet.name} ({pet.type})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {pets?.length === 0 && (
           <p className="text-sm text-destructive">You need to add a pet first.</p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input id="date" name="date" type="date" required className="rounded-xl" disabled={isLoading} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="time">Time</Label>
          <Input id="time" name="time" type="time" required className="rounded-xl" disabled={isLoading} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Special Requests</Label>
        <Textarea 
          id="notes" 
          name="notes" 
          className="rounded-xl min-h-[80px]"
          placeholder="Any specific instructions?"
          disabled={isLoading}
        />
      </div>

      <Button type="submit" className="w-full rounded-xl text-lg font-medium" disabled={!pets?.length || isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Confirming...
          </>
        ) : (
          'Confirm Booking'
        )}
      </Button>
    </form>
  )
}
