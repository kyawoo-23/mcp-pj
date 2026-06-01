import ReactMarkdown from "react-markdown";

interface MarkdownContentProps {
  text: string;
}

/** Shared Markdown bubble body used by chat messages and OpenUI-aware replies. */
export function MarkdownContent({ text }: MarkdownContentProps) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap leading-relaxed">
      <ReactMarkdown>{text}</ReactMarkdown>
    </div>
  );
}
