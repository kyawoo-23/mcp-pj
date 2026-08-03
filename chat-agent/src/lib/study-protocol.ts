import type { Database } from "../../../supabase/types/database.types";

export type StudyProtocolVersion =
  Database["public"]["Enums"]["study_protocol_version"];

const DEFAULT_STUDY_PROTOCOL_VERSION: StudyProtocolVersion = "v2_criteria";

const STUDY_PROTOCOL_VERSIONS = new Set<StudyProtocolVersion>([
  "v1_simple",
  "v2_criteria",
]);

function parseStudyProtocolVersion(
  raw: string | undefined,
): StudyProtocolVersion {
  if (raw && STUDY_PROTOCOL_VERSIONS.has(raw as StudyProtocolVersion)) {
    return raw as StudyProtocolVersion;
  }
  return DEFAULT_STUDY_PROTOCOL_VERSION;
}

export const CURRENT_STUDY_PROTOCOL_VERSION = parseStudyProtocolVersion(
  process.env.NEXT_PUBLIC_CURRENT_STUDY_PROTOCOL_VERSION ??
    process.env.CURRENT_STUDY_PROTOCOL_VERSION,
);
