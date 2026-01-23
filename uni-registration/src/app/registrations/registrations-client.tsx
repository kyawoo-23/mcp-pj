"use client";

import { useState } from "react";
import { dropRegistration } from "@/app/actions/registrations";
import { RegistrationCard } from "@/components/registrations/registration-card";
import { ScheduleView } from "@/components/registrations/schedule-view";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const router = useRouter();

  const handleDrop = async (registrationId: string) => {
    setIsLoading(true);
    try {
      const result = await dropRegistration(registrationId);
      if (result.success) {
        toast.success(result.message || "Successfully dropped course");
        if (result.taskCompleted) {
          toast.success("Task completed: Drop a course");
        }
        router.refresh();
      } else {
        toast.error(result.error || "Failed to drop course");
      }
    } catch (error) {
      toast.error("An error occurred while dropping the course");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="list" className="w-full">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="schedule">Schedule View</TabsTrigger>
        </TabsList>
        <TabsContent value="list" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            {registrations.map((registration) => (
              <RegistrationCard
                key={registration.id}
                registration={registration}
                onDrop={handleDrop}
                isLoading={isLoading}
              />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="schedule" className="mt-6">
          <ScheduleView registrations={registrations} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

