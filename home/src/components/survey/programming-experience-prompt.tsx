"use client";

import { useState } from "react";
import { HelpCircle } from "lucide-react";
import type { ProfileRow } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PROGRAMMING_EXPERIENCE_OPTIONS } from "../../utils/constants";

interface ProgrammingExperiencePromptProps {
  saving: boolean;
  onSave: (
    programmingExperience: ProfileRow["programming_experience"],
  ) => Promise<void>;
}

export function ProgrammingExperiencePrompt({
  saving,
  onSave,
}: ProgrammingExperiencePromptProps) {
  const [programmingExperience, setProgrammingExperience] = useState<
    ProfileRow["programming_experience"] | null
  >(null);

  const handleSubmit = () => {
    if (programmingExperience) {
      onSave(programmingExperience);
    }
  };

  return (
    <div className='flex min-h-screen items-center justify-center p-6 pb-32'>
      <Card className='w-full max-w-xl shadow-lg'>
        <CardHeader>
          <CardTitle>One quick update</CardTitle>
          <CardDescription>
            We added a programming experience question to the survey. Please
            answer it to continue.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <div className='flex items-center gap-2'>
              <Label>Programming experience</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type='button'
                    className='text-muted-foreground hover:text-foreground'
                  >
                    <HelpCircle className='h-4 w-4' />
                    <span className='sr-only'>Programming experience info</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className='w-80 text-sm'>
                  Include university courses, personal projects, internships,
                  and self-study.
                </PopoverContent>
              </Popover>
            </div>
            <Select
              value={programmingExperience ?? undefined}
              onValueChange={(value) =>
                setProgrammingExperience(
                  value as ProfileRow["programming_experience"],
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder='Select your programming experience' />
              </SelectTrigger>
              <SelectContent>
                {PROGRAMMING_EXPERIENCE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value || ""}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            className='w-full'
            disabled={!programmingExperience || saving}
            onClick={handleSubmit}
          >
            {saving ? "Saving..." : "Continue"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
