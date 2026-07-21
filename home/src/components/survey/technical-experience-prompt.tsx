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
import {
  TECHNICAL_EXPERIENCE_HELP,
  TECHNICAL_EXPERIENCE_OPTIONS,
} from "../../utils/constants";

interface TechnicalExperiencePromptProps {
  saving: boolean;
  onSave: (
    technicalExperience: ProfileRow["technical_experience"],
  ) => Promise<void>;
}

export function TechnicalExperiencePrompt({
  saving,
  onSave,
}: TechnicalExperiencePromptProps) {
  const [technicalExperience, setTechnicalExperience] = useState<
    ProfileRow["technical_experience"] | null
  >(null);

  const handleSubmit = () => {
    if (technicalExperience != null) {
      onSave(technicalExperience);
    }
  };

  return (
    <div className='flex min-h-screen items-center justify-center p-6 pb-32'>
      <Card className='w-full max-w-xl shadow-lg'>
        <CardHeader>
          <CardTitle>One quick update</CardTitle>
          <CardDescription>
            We added a technical proficiency question to the survey. Please
            answer it to continue.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <div className='flex items-center gap-2'>
              <Label>Technical proficiency</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type='button'
                    className='text-muted-foreground hover:text-foreground'
                  >
                    <HelpCircle className='h-4 w-4' />
                    <span className='sr-only'>Technical proficiency info</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className='w-80 text-sm'>
                  {TECHNICAL_EXPERIENCE_HELP}
                </PopoverContent>
              </Popover>
            </div>
            <Select
              value={technicalExperience ?? undefined}
              onValueChange={(value) =>
                setTechnicalExperience(
                  value as ProfileRow["technical_experience"],
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder='Select your technical proficiency' />
              </SelectTrigger>
              <SelectContent>
                {TECHNICAL_EXPERIENCE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value || ""}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            className='w-full'
            disabled={technicalExperience == null || saving}
            onClick={handleSubmit}
          >
            {saving ? "Saving..." : "Continue"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
