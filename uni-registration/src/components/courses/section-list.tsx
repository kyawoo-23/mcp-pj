"use client";

import { SectionCard } from "./section-card";
import type { CourseSection } from "@/lib/types";

interface SectionListProps {
  sections: CourseSection[];
  onRegister?: (sectionId: string) => void;
  registeredSectionIds?: string[];
  isLoading?: boolean;
}

export function SectionList({
  sections,
  onRegister,
  registeredSectionIds = [],
  isLoading = false,
}: SectionListProps) {
  if (sections.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No sections available for this course.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {sections.map((section) => (
        <SectionCard
          key={section.id}
          section={section}
          onRegister={onRegister}
          isRegistered={registeredSectionIds.includes(section.id)}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}

