const AGE_RANGE_LABELS: Record<string, string> = {
  under_18: "Under 18",
  "18_24": "18-24",
  "25_34": "25-34",
  "35_44": "35-44",
  "45_54": "45-54",
  "55_plus": "55+",
  prefer_not_say: "Prefer not to say",
};

const GENDER_LABELS: Record<string, string> = {
  female: "Female",
  male: "Male",
  prefer_not_say: "Prefer not to say",
};

const TECHNICAL_PROFICIENCY_LABELS: Record<string, string> = {
  none: "None",
  limited: "Limited",
  moderate: "Moderate",
  advanced: "Advanced",
};

const TECHNICAL_EXPERIENCE_LABELS: Record<string, string> = {
  none: "None",
  under_1_year: "Under 1 year",
  one_to_three_years: "1–3 years",
  more_than_three_years: "More than 3 years",
};

const AI_TOOL_FREQUENCY_LABELS: Record<string, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  rarely: "Rarely",
  never: "Never",
};

function labelFrom(map: Record<string, string>, value: string): string {
  return map[value] ?? value;
}

export function getAgeRangeLabel(value: string): string {
  return labelFrom(AGE_RANGE_LABELS, value);
}

export function getGenderLabel(value: string): string {
  return labelFrom(GENDER_LABELS, value);
}

export function getTechnicalProficiencyLabel(value: string): string {
  return labelFrom(TECHNICAL_PROFICIENCY_LABELS, value);
}

export function getTechnicalExperienceLabel(value: string): string {
  return labelFrom(TECHNICAL_EXPERIENCE_LABELS, value);
}

export function getAiToolFrequencyLabel(value: string): string {
  return labelFrom(AI_TOOL_FREQUENCY_LABELS, value);
}
