"use client";

import { useState } from "react";
import { dropRegistration } from "@/app/actions/registrations";
import { RegistrationCard } from "@/components/registrations/registration-card";
import { ScheduleView } from "@/components/registrations/schedule-view";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { StudentRegistrationWithDetails } from "@/lib/types";
import { useRouter } from "next/navigation";

interface RegistrationsClientProps {
  registrations: StudentRegistrationWithDetails[];
}

export default function RegistrationsClient({
  registrations,
}: RegistrationsClientProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [registrationToDrop, setRegistrationToDrop] = useState<string | null>(
    null,
  );
  const router = useRouter();

  const handleDrop = (registrationId: string) => {
    setRegistrationToDrop(registrationId);
  };

  const confirmDrop = async () => {
    if (!registrationToDrop) return;

    setIsLoading(true);
    try {
      const result = await dropRegistration(registrationToDrop);
      if (result.success) {
        toast.success(result.message || "Successfully dropped course");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to drop course");
      }
    } catch (_error) {
      toast.error("An error occurred while dropping the course");
    } finally {
      setIsLoading(false);
      setRegistrationToDrop(null);
    }
  };

  const selectedRegistration = registrations.find(
    (r) => r.id === registrationToDrop,
  );
  const courseCode = selectedRegistration?.course_sections?.courses?.code;
  const courseTitle = selectedRegistration?.course_sections?.courses?.title;

  return (
    <div className='space-y-4'>
      <Tabs defaultValue='list' className='w-full'>
        <TabsList>
          <TabsTrigger value='list'>List View</TabsTrigger>
          <TabsTrigger value='schedule'>Schedule View</TabsTrigger>
        </TabsList>
        <TabsContent value='list' className='mt-6'>
          <div className='grid gap-4 md:grid-cols-2'>
            {registrations.map((registration) => (
              <RegistrationCard
                key={registration.id}
                registration={registration}
                onDrop={handleDrop}
                isLoading={isLoading && registrationToDrop === registration.id}
              />
            ))}
          </div>
        </TabsContent>
        <TabsContent value='schedule' className='mt-6'>
          <ScheduleView registrations={registrations} />
        </TabsContent>
      </Tabs>

      <Dialog
        open={!!registrationToDrop}
        onOpenChange={(open) => !open && setRegistrationToDrop(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Drop Course</DialogTitle>
            <DialogDescription>
              Are you sure you want to drop{" "}
              <span className='font-semibold'>
                {courseCode} - {courseTitle}
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setRegistrationToDrop(null)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant='destructive'
              onClick={confirmDrop}
              disabled={isLoading}
            >
              {isLoading ? "Dropping..." : "Drop Course"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
