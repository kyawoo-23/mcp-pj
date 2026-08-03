"use client";

import * as React from "react";
import {
  extractOpenUISegments,
  hasOpenUIBlock,
} from "@/lib/openui/extract-openui-block";
import { MarkdownContent } from "./markdown-content";
import { OpenUIMessage } from "./openui-message";

interface OpenUIAwareContentProps {
  text: string;
  isStreaming?: boolean;
}

/**
 * Renders assistant text as Markdown, splitting out fenced OpenUI blocks when
 * present. Skips segment parsing when there is no fence (common case).
 */
export function OpenUIAwareContent({
  text,
  isStreaming,
}: OpenUIAwareContentProps) {
  const mayContainOpenUI = isStreaming || hasOpenUIBlock(text);

  const segments = React.useMemo(
    () => (mayContainOpenUI ? extractOpenUISegments(text) : null),
    [mayContainOpenUI, text],
  );

  if (!mayContainOpenUI || segments === null) {
    return <MarkdownContent text={text} />;
  }

  const onlyMarkdown =
    segments.length === 1 && segments[0]?.type === "markdown";

  if (onlyMarkdown) {
    return <MarkdownContent text={text} />;
  }

  return (
    <div className="flex flex-col gap-2">
      {segments.map((segment, index) =>
        segment.type === "openui" ? (
          <OpenUIMessage
            key={`openui-${index}`}
            code={segment.content}
            isStreaming={Boolean(isStreaming && segment.open)}
          />
        ) : (
          <MarkdownContent key={`md-${index}`} text={segment.content} />
        ),
      )}
    </div>
  );
}
