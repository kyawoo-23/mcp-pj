import {
  getAgeRangeLabel,
  getGenderLabel,
  getTechnicalExperienceLabel,
  getTechnicalProficiencyLabel,
  getAiToolFrequencyLabel,
} from "@/utils/profile-demographics";
import type { ProfileRow } from "@/lib/types";

export type DemographicsState = Pick<
  ProfileRow,
  | "age_range"
  | "gender"
  | "technical_proficiency"
  | "technical_experience"
  | "ai_tool_frequency"
>;

export type DemographicsDisplay = {
  [K in keyof DemographicsState]: DemographicsState[K] | null;
};

export const DEMOGRAPHIC_FIELDS: Array<{
  key: keyof DemographicsState;
  label: string;
  format: (value: string) => string;
}> = [
  { key: "age_range", label: "Age range", format: getAgeRangeLabel },
  { key: "gender", label: "Gender", format: getGenderLabel },
  {
    key: "technical_experience",
    label: "Years-based technical proficiency",
    format: getTechnicalExperienceLabel,
  },
  {
    key: "ai_tool_frequency",
    label: "AI tool usage",
    format: getAiToolFrequencyLabel,
  },
  {
    key: "technical_proficiency",
    label: "Subjective technical proficiency",
    format: getTechnicalProficiencyLabel,
  },
];

export const EMPTY_DEMOGRAPHICS = Object.fromEntries(
  DEMOGRAPHIC_FIELDS.map(({ key }) => [key, null]),
) as DemographicsDisplay;

export function demographicsFromProfile(
  profile: Pick<ProfileRow, keyof DemographicsState>,
): DemographicsDisplay {
  return Object.fromEntries(
    DEMOGRAPHIC_FIELDS.map(({ key }) => [key, profile[key] ?? null]),
  ) as DemographicsDisplay;
}
