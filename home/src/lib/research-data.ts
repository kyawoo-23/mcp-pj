import { readFile } from "node:fs/promises";
import path from "node:path";

import type { AnalysisPayload } from "@/lib/types";
import type { StudyProtocolVersion } from "@/lib/analysis-calculations";
import { parseProtocolFromSearchParam } from "@/lib/study-protocol-labels";

const RESEARCH_DATA_DIR = path.join(process.cwd(), "src/data");

const RESEARCH_SNAPSHOT_PATHS = {
  v1_simple: path.join(RESEARCH_DATA_DIR, "research-v1.json"),
  v2_criteria: path.join(RESEARCH_DATA_DIR, "research-v2.json"),
} satisfies Record<StudyProtocolVersion, string>;

type ResearchJsonWrapper = Array<{ json_build_object: AnalysisPayload }>;

function unwrapResearchJson(raw: ResearchJsonWrapper): AnalysisPayload {
  return raw[0].json_build_object;
}

function injectProtocolVersion(
  payload: AnalysisPayload,
  version: StudyProtocolVersion,
): AnalysisPayload {
  return {
    ...payload,
    task_progress: payload.task_progress.map((row) => ({
      ...row,
      protocol_version: row.protocol_version ?? version,
    })),
    task_survey_responses: payload.task_survey_responses.map((row) => ({
      ...row,
      protocol_version: row.protocol_version ?? version,
    })),
    task_interview_responses: payload.task_interview_responses.map((row) => ({
      ...row,
      protocol_version: row.protocol_version ?? version,
    })),
  };
}

async function loadResearchSnapshot(
  version: StudyProtocolVersion,
): Promise<AnalysisPayload | null> {
  try {
    const raw = await readFile(RESEARCH_SNAPSHOT_PATHS[version], "utf-8");
    const parsed = JSON.parse(raw) as ResearchJsonWrapper;
    const payload = unwrapResearchJson(parsed);
    return injectProtocolVersion(payload, version);
  } catch {
    return null;
  }
}

export async function getResearchPayload(
  protocolParam: string | null | undefined,
): Promise<{
  version: StudyProtocolVersion;
  payload: AnalysisPayload | null;
  v2Available: boolean;
}> {
  const version =
    parseProtocolFromSearchParam(protocolParam) ?? "v1_simple";
  const [v1Payload, v2Payload] = await Promise.all([
    loadResearchSnapshot("v1_simple"),
    loadResearchSnapshot("v2_criteria"),
  ]);
  const v2Available = v2Payload !== null;
  const payload = version === "v2_criteria" ? v2Payload : v1Payload;

  return { version, payload, v2Available };
}
