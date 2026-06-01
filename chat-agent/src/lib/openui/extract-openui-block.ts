import { OPENUI_FENCE_LANG } from "./openui-config";

export interface OpenUISegment {
  type: "markdown" | "openui";
  /** For markdown: the raw markdown text. For openui: the OpenUI Lang code. */
  content: string;
  /**
   * True when an OpenUI segment came from a fence that has not been closed yet
   * (i.e. the reply is still streaming). Renderers should pass `isStreaming`.
   */
  open?: boolean;
}

// Matches a complete fenced code block, capturing the info string and body.
const FENCED_BLOCK_RE = /```([^\n`]*)\r?\n([\s\S]*?)```/g;
// Matches a trailing fence that has been opened but not yet closed.
const UNCLOSED_FENCE_RE = /```([^\n`]*)\r?\n([\s\S]*)$/;

// Hoisted once (Vercel 7.9): used by hasOpenUIBlock on the hot path.
const OPENUI_FENCE_HINT = /```(?:openui|openui-lang)\b/i;
const UNTAGGED_ROOT_HINT = /```\r?\n\s*root\s*=/m;

function isOpenUIFence(info: string, body: string): boolean {
  const lang = info.trim().toLowerCase();
  // Accept the canonical tag plus OpenUI's built-in inline-mode tag.
  if (lang === OPENUI_FENCE_LANG || lang === "openui-lang") return true;
  // Be forgiving: an untagged block whose first statement is `root = ...`
  // is almost certainly OpenUI Lang emitted without the language tag.
  if (lang === "") return /^\s*root\s*=/.test(body);
  return false;
}

function pushMarkdown(segments: OpenUISegment[], text: string): void {
  if (text.trim().length === 0) return;
  segments.push({ type: "markdown", content: text });
}

/**
 * Split assistant text into ordered Markdown and OpenUI segments.
 *
 * - Complete ```openui blocks become `openui` segments.
 * - A trailing, not-yet-closed ```openui block (during streaming) becomes an
 *   `openui` segment flagged `open: true` so it can render progressively.
 * - All other text (including non-openui code fences) stays as `markdown`.
 *
 * If no OpenUI content is found, returns a single markdown segment with the
 * original text, so callers can cheaply detect "nothing to render here".
 */
export function extractOpenUISegments(text: string): OpenUISegment[] {
  const segments: OpenUISegment[] = [];
  let lastIndex = 0;
  let foundOpenUI = false;

  FENCED_BLOCK_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = FENCED_BLOCK_RE.exec(text)) !== null) {
    const [full, info, body] = match;
    const before = text.slice(lastIndex, match.index);

    if (isOpenUIFence(info, body)) {
      pushMarkdown(segments, before);
      segments.push({ type: "openui", content: body });
      foundOpenUI = true;
    } else {
      // Keep non-openui fences as part of the surrounding markdown.
      pushMarkdown(segments, before + full);
    }
    lastIndex = match.index + full.length;
  }

  const remainder = text.slice(lastIndex);
  const unclosed = remainder.match(UNCLOSED_FENCE_RE);
  if (unclosed && isOpenUIFence(unclosed[1], unclosed[2])) {
    const before = remainder.slice(0, unclosed.index);
    pushMarkdown(segments, before);
    segments.push({ type: "openui", content: unclosed[2], open: true });
    foundOpenUI = true;
  } else {
    pushMarkdown(segments, remainder);
  }

  if (!foundOpenUI) {
    return [{ type: "markdown", content: text }];
  }
  return segments;
}

/**
 * Cheap check: does the text likely contain an OpenUI block?
 * Uses regex hints first; avoids the full segment parser on plain Markdown.
 */
export function hasOpenUIBlock(text: string): boolean {
  if (!OPENUI_FENCE_HINT.test(text) && !UNTAGGED_ROOT_HINT.test(text)) {
    return false;
  }
  return extractOpenUISegments(text).some(
    (segment) => segment.type === "openui",
  );
}
