"use client";

import { useState } from "react";
import { registerForSection } from "@/app/actions/registrations";
import { SectionList } from "@/components/courses/section-list";
import { toast } from "sonner";
import type { CourseSection } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";

interface CourseDetailClientProps {
  sections: CourseSection[];
  registeredSectionIds: string[];
}

export default function CourseDetailClient({
  sections,
  registeredSectionIds,
}: CourseDetailClientProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [registeredIds, setRegisteredIds] = useState(registeredSectionIds);
  const router = useRouter();
  const { user } = useAuth();

  const handleRegister = async (sectionId: string) => {
    // Check authentication before attempting registration
    if (!user) {
      // Redirect to login with return URL
      const currentPath = window.location.pathname;
      router.push(`/auth/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    setIsLoading(true);
    try {
      const result = await registerForSection(sectionId);
      if (result.success) {
        toast.success(result.message || "Successfully registered for section");
        setRegisteredIds([...registeredIds, sectionId]);
        router.refresh();
      } else {
        // If server returns "Not authenticated", redirect to login
        if (result.error === "Not authenticated") {
          const currentPath = window.location.pathname;
          router.push(
            `/auth/login?redirect=${encodeURIComponent(currentPath)}`
          );
        } else {
          toast.error(result.error || "Failed to register for section");
        }
      }
    } catch {
      toast.error("An error occurred while registering");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='space-y-4'>
      <SectionList
        sections={sections}
        onRegister={handleRegister}
        registeredSectionIds={registeredIds}
        isLoading={isLoading}
      />
    </div>
  );
}
