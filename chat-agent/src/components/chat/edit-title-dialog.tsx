"use client";

import * as React from "react";
import { useRouter } from "@bprogress/next/app";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateConversationTitleAction } from "@/app/actions/conversations";

interface EditTitleDialogProps {
  conversationId: string;
  initialTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditTitleDialog({
  conversationId,
  initialTitle,
  open,
  onOpenChange,
}: EditTitleDialogProps) {
  const router = useRouter();
  const [title, setTitle] = React.useState(initialTitle);
  const [isLoading, setIsLoading] = React.useState(false);

  // Reset title when dialog opens
  React.useEffect(() => {
    if (open) {
      setTitle(initialTitle);
    }
  }, [open, initialTitle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Title cannot be empty");
      return;
    }

    if (title === initialTitle) {
      onOpenChange(false);
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await updateConversationTitleAction(
        conversationId,
        title
      );

      if (error) {
        throw new Error(error);
      }

      toast.success("Conversation title updated");
      router.refresh(); // Refresh to update the title in the UI
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update title:", error);
      toast.error("Failed to update title");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[425px]'>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Title</DialogTitle>
            <DialogDescription>
              Enter a new title for this conversation.
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='title' className='text-right'>
                Title
              </Label>
              <Input
                id='title'
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className='col-span-3'
                autoFocus
                disabled={isLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={isLoading}>
              {isLoading ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
