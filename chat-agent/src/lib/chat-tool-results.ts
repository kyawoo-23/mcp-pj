type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseJsonObject(text: string): UnknownRecord | null {
  try {
    const parsed: unknown = JSON.parse(text);
    return isRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function normalizeTextContent(content: unknown): UnknownRecord | null {
  if (!Array.isArray(content)) return null;

  for (const item of content) {
    if (!isRecord(item) || item.type !== "text" || typeof item.text !== "string") {
      continue;
    }
    const parsed = parseJsonObject(item.text);
    if (parsed) return parsed;
  }

  return null;
}

export function normalizeToolResultOutput(
  output: unknown,
): Record<string, unknown> | undefined {
  if (typeof output === "string") {
    return parseJsonObject(output) ?? { message: output };
  }

  if (!isRecord(output)) return undefined;

  const contentResult = normalizeTextContent(output.content);
  if (contentResult) return contentResult;

  if ("result" in output) {
    const result = normalizeToolResultOutput(output.result);
    if (result) return result;
  }

  if ("output" in output) {
    const result = normalizeToolResultOutput(output.output);
    if (result) return result;
  }

  return output;
}
