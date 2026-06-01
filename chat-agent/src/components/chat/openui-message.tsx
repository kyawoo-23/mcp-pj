"use client";

import * as React from "react";
import {
  Renderer,
  type OpenUIError,
  type ParseResult,
} from "@openuidev/react-lang";
import { chatOpenUILibrary } from "@/lib/openui/chat-library";

/** Parser errors that mean nothing renderable was produced. */
const FATAL_ERROR_CODES = new Set(["parse-failed", "parse-exception"]);

/** Every valid program assigns `root` first (OpenUI Lang spec). */
const ROOT_ASSIGNMENT_RE = /^\s*root\s*=/m;

interface OpenUIMessageProps {
  /** Raw OpenUI Lang code extracted from the assistant reply. */
  code: string;
  isStreaming?: boolean;
}

/** Plain-text fallback so content is never hidden if OpenUI cannot render. */
function OpenUIFallback({ code }: { code: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg border border-border/50 bg-muted/40 p-3 text-xs text-muted-foreground">
      <code>{code.trim()}</code>
    </pre>
  );
}

class OpenUIErrorBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("OpenUI render error:", error);
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

function OpenUIMessageInner({ code, isStreaming }: OpenUIMessageProps) {
  const [showFallback, setShowFallback] = React.useState(false);

  React.useEffect(() => {
    setShowFallback(false);
  }, [code]);

  const handleError = React.useCallback(
    (errors: OpenUIError[]) => {
      // While streaming, the code is usually incomplete; wait until settled.
      if (isStreaming) return;
      if (errors.some((error) => FATAL_ERROR_CODES.has(error.code))) {
        setShowFallback(true);
      }
    },
    [isStreaming],
  );

  const handleParseResult = React.useCallback(
    (result: ParseResult | null) => {
      if (isStreaming) return;
      if (!result?.root) {
        setShowFallback(true);
      }
    },
    [isStreaming],
  );

  if (showFallback) {
    return <OpenUIFallback code={code} />;
  }

  // After streaming, reject bodies that cannot be valid OpenUI Lang.
  if (!isStreaming && !ROOT_ASSIGNMENT_RE.test(code)) {
    return <OpenUIFallback code={code} />;
  }

  return (
    <OpenUIErrorBoundary
      key={code}
      fallback={<OpenUIFallback code={code} />}
    >
      <div role="region" aria-label="Structured assistant summary">
        <Renderer
          library={chatOpenUILibrary}
          response={code}
          isStreaming={isStreaming}
          onError={handleError}
          onParseResult={handleParseResult}
        />
      </div>
    </OpenUIErrorBoundary>
  );
}

export const OpenUIMessage = React.memo(OpenUIMessageInner);
