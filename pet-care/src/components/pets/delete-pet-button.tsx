'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deletePet } from '@/app/pets/actions'
import { Button } from '@/components/ui/button'
import { Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function DeletePetButton({ id }: { id: string }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    setIsDeleting(true)
    const result = await deletePet(id)

    if (result.error) {
      toast.error(result.error)
      setIsDeleting(false)
    } else {
      toast.success('Pet deleted successfully')
      router.push('/pets')
      router.refresh()
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="ghost" 
          className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full transition-all duration-300 hover:scale-105"
          disabled={isDeleting}
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Pet
            </>
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-3xl border-2 border-primary/20 shadow-xl bg-white/95 backdrop-blur-sm">
        <AlertDialogHeader className="items-center text-center">
          <div className="h-16 w-16 bg-destructive/10 rounded-full flex items-center justify-center mb-2 animate-in zoom-in duration-300">
             <Trash2 className="h-8 w-8 text-destructive" />
          </div>
          <AlertDialogTitle className="text-2xl font-bold text-primary">Say goodbye?</AlertDialogTitle>
          <AlertDialogDescription className="text-base text-muted-foreground max-w-xs mx-auto">
            Are you sure you want to delete this pet? This action cannot be undone and all grooming history will be lost.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center gap-3 mt-4 w-full">
          <AlertDialogCancel className="rounded-xl border-2 border-muted hover:bg-muted/50 flex-1 sm:flex-none sm:w-32">
            No, keep it
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete} 
            className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 flex-1 sm:flex-none sm:w-32 shadow-md hover:shadow-lg transition-all"
          >
            Yes, delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
