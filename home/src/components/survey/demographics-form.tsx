"use client";

import { useState } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AGE_OPTIONS,
  GENDER_OPTIONS,
  TECHNICAL_PROFICIENCY_OPTIONS,
  AI_TOOL_FREQUENCY_OPTIONS,
} from "../../utils/constants";

interface DemographicsFormProps {
  initialAgeRange: ProfileRow["age_range"] | null;
  initialGender: ProfileRow["gender"] | null;
  initialTechnicalProficiency: ProfileRow["technical_proficiency"] | null;
  initialAiToolFrequency: ProfileRow["ai_tool_frequency"] | null;
  saving: boolean;
  onSave: (
    ageRange: ProfileRow["age_range"],
    gender: ProfileRow["gender"],
    technicalProficiency: ProfileRow["technical_proficiency"],
    aiToolFrequency: ProfileRow["ai_tool_frequency"],
  ) => Promise<void>;
}

export function DemographicsForm({
  initialAgeRange,
  initialGender,
  initialTechnicalProficiency,
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
  const [technicalProficiency, setTechnicalProficiency] = useState<
    ProfileRow["technical_proficiency"] | null
  >(initialTechnicalProficiency);
  const [aiToolFrequency, setAiToolFrequency] = useState<
    ProfileRow["ai_tool_frequency"] | null
  >(initialAiToolFrequency);

  const handleSubmit = () => {
    if (ageRange && gender && technicalProficiency && aiToolFrequency) {
      onSave(ageRange, gender, technicalProficiency, aiToolFrequency);
    }
  };

  const isFormComplete =
    ageRange && gender && technicalProficiency && aiToolFrequency;

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
            <Label>Technical proficiency</Label>
            <Select
              value={technicalProficiency ?? undefined}
              onValueChange={(value) =>
                setTechnicalProficiency(
                  value as ProfileRow["technical_proficiency"],
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder='Select your technical proficiency' />
              </SelectTrigger>
              <SelectContent>
                {TECHNICAL_PROFICIENCY_OPTIONS.map((option) => (
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
