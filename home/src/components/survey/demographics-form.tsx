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
  AGE_OPTIONS,
  GENDER_OPTIONS,
  PROGRAMMING_EXPERIENCE_OPTIONS,
  AI_TOOL_FREQUENCY_OPTIONS,
} from "../../utils/constants";

interface DemographicsFormProps {
  initialAgeRange: ProfileRow["age_range"] | null;
  initialGender: ProfileRow["gender"] | null;
  initialProgrammingExperience: ProfileRow["programming_experience"] | null;
  initialAiToolFrequency: ProfileRow["ai_tool_frequency"] | null;
  saving: boolean;
  onSave: (
    ageRange: ProfileRow["age_range"],
    gender: ProfileRow["gender"],
    programmingExperience: ProfileRow["programming_experience"],
    aiToolFrequency: ProfileRow["ai_tool_frequency"],
  ) => Promise<void>;
}

export function DemographicsForm({
  initialAgeRange,
  initialGender,
  initialProgrammingExperience,
  initialAiToolFrequency,
  saving,
  onSave,
}: DemographicsFormProps) {
  const [ageRange, setAgeRange] = useState<ProfileRow["age_range"] | null>(
    initialAgeRange,
  );
  const [gender, setGender] = useState<ProfileRow["gender"] | null>(
    initialGender,
  );
  const [programmingExperience, setProgrammingExperience] = useState<
    ProfileRow["programming_experience"] | null
  >(initialProgrammingExperience);
  const [aiToolFrequency, setAiToolFrequency] = useState<
    ProfileRow["ai_tool_frequency"] | null
  >(initialAiToolFrequency);

  const handleSubmit = () => {
    if (ageRange && gender && programmingExperience && aiToolFrequency) {
      onSave(ageRange, gender, programmingExperience, aiToolFrequency);
    }
  };

  const isFormComplete =
    ageRange && gender && programmingExperience && aiToolFrequency;

  return (
    <div className='flex min-h-screen items-center justify-center bg-background p-6 pb-32'>
      <Card className='w-full max-w-xl shadow-lg'>
        <CardHeader>
          <CardTitle>Survey Demographics</CardTitle>
          <CardDescription>
            Please complete the demographic questions to start the survey.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Label>Age range</Label>
            <Select
              value={ageRange ?? undefined}
              onValueChange={(value) =>
                setAgeRange(value as ProfileRow["age_range"])
              }
            >
              <SelectTrigger>
                <SelectValue placeholder='Select your age range' />
              </SelectTrigger>
              <SelectContent>
                {AGE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value || ""}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='space-y-2'>
            <Label>Gender identity</Label>
            <Select
              value={gender ?? undefined}
              onValueChange={(value) =>
                setGender(value as ProfileRow["gender"])
              }
            >
              <SelectTrigger>
                <SelectValue placeholder='Select your gender' />
              </SelectTrigger>
              <SelectContent>
                {GENDER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value || ""}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
          <div className='space-y-2'>
            <Label>How often do you use AI-powered tools or chatbots?</Label>
            <Select
              value={aiToolFrequency ?? undefined}
              onValueChange={(value) =>
                setAiToolFrequency(value as ProfileRow["ai_tool_frequency"])
              }
            >
              <SelectTrigger>
                <SelectValue placeholder='Select your usage frequency' />
              </SelectTrigger>
              <SelectContent>
                {AI_TOOL_FREQUENCY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value || ""}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            className='w-full'
            disabled={!isFormComplete || saving}
            onClick={handleSubmit}
          >
            {saving ? "Saving..." : "Save demographics"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
