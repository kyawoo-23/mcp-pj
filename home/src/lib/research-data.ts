import { readFile } from "node:fs/promises";
import path from "node:path";

import type { AnalysisPayload } from "@/lib/types";
import type { StudyProtocolVersion } from "@/lib/analysis-calculations";
import { parseProtocolFromSearchParam } from "@/lib/study-protocol-labels";

import rawDataV1 from "@/data/research.json";

const RESEARCH_V2_JSON_PATH = path.join(
  process.cwd(),
  "src/data/research-v2.json",
);

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

export function getResearchPayloadV1(): AnalysisPayload {
  const payload = unwrapResearchJson(rawDataV1 as ResearchJsonWrapper);
  return injectProtocolVersion(payload, "v1_simple");
}

/** Returns v2 snapshot when `research-v2.json` exists; otherwise null. */
export async function getResearchPayloadV2(): Promise<AnalysisPayload | null> {
  try {
    const raw = await readFile(RESEARCH_V2_JSON_PATH, "utf-8");
    const parsed = JSON.parse(raw) as ResearchJsonWrapper;
    const payload = unwrapResearchJson(parsed);
    return injectProtocolVersion(payload, "v2_criteria");
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
  const v2Payload = await getResearchPayloadV2();
  const v2Available = v2Payload !== null;

  if (version === "v2_criteria") {
    return { version, payload: v2Payload, v2Available };
  }

  return { version, payload: getResearchPayloadV1(), v2Available };
}
