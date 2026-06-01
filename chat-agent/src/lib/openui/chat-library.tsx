"use client";

import { createLibrary, defineComponent } from "@openuidev/react-lang";
import { z } from "zod/v4";
import { cn } from "@/lib/utils";

/**
 * Render-only OpenUI component library for the chat agent.
 *
 * Intentionally small and presentational: these components describe how an
 * assistant reply should be laid out, they never fetch data or mutate state.
 * Task execution still flows through the normal chat + MCP tool path, so we do
 * NOT register any Query()/Mutation()-capable components here.
 */

const TEXT_SIZE_CLASS: Record<string, string> = {
  small: "text-xs text-muted-foreground",
  default: "text-sm text-foreground",
  large: "text-base font-medium text-foreground",
  "large-heavy": "text-base font-semibold text-foreground",
};

const TextContent = defineComponent({
  name: "TextContent",
  description:
    "A run of text. Use size 'large-heavy' for a short heading, 'small' for secondary/help text, and 'default' for normal body copy.",
  props: z.object({
    text: z.string(),
    size: z.enum(["small", "default", "large", "large-heavy"]).optional(),
  }),
  component: ({ props }) => (
    <p className={TEXT_SIZE_CLASS[props.size ?? "default"]}>{props.text}</p>
  ),
});

const KeyValue = defineComponent({
  name: "KeyValue",
  description:
    "A single labeled detail row (e.g. label 'Room', value 'Study Room 202'). Group several inside a Stack to summarize a booking, registration, or course.",
  props: z.object({
    label: z.string(),
    value: z.string(),
  }),
  component: ({ props }) => (
    <div className="flex items-baseline justify-between gap-3 border-b border-border/40 py-1 last:border-b-0">
      <span className="text-xs font-medium text-muted-foreground">
        {props.label}
      </span>
      <span className="text-right text-sm text-foreground">{props.value}</span>
    </div>
  ),
});

const OptionList = defineComponent({
  name: "OptionList",
  description:
    "A list of choices presented to the user (e.g. available sections or facilities). The user replies in plain text to pick one; do not add buttons.",
  props: z.object({
    options: z.array(z.string()),
    ordered: z.boolean().optional(),
  }),
  component: ({ props }) => {
    const items = props.options.map((option) => (
      <li key={option} className="text-sm text-foreground">
        {option}
      </li>
    ));
    return props.ordered ? (
      <ol className="list-decimal space-y-1 pl-5">{items}</ol>
    ) : (
      <ul className="list-disc space-y-1 pl-5">{items}</ul>
    );
  },
});

const CALLOUT_VARIANT_CLASS: Record<string, string> = {
  info: "border-border/60 bg-muted/40 text-foreground",
  success:
    "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  warning:
    "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  error:
    "border-destructive/40 bg-destructive/10 text-destructive dark:text-destructive",
};

const Callout = defineComponent({
  name: "Callout",
  description:
    "A short highlighted notice. Use variant 'success' for confirmations, 'warning' for cautions, 'error' for failures, and 'info' for neutral notes.",
  props: z.object({
    text: z.string(),
    variant: z.enum(["info", "success", "warning", "error"]).optional(),
  }),
  component: ({ props }) => (
    <div
      className={cn(
        "rounded-lg border px-3 py-2 text-sm",
        CALLOUT_VARIANT_CLASS[props.variant ?? "info"],
      )}
    >
      {props.text}
    </div>
  ),
});

const GAP_CLASS: Record<string, string> = {
  tight: "gap-1",
  normal: "gap-2",
  loose: "gap-4",
};

const Stack = defineComponent({
  name: "Stack",
  description:
    "Vertical group of related items. Use it to cluster KeyValue rows or a few lines of text into one visual block.",
  props: z.object({
    children: z.array(
      z.union([TextContent.ref, KeyValue.ref, OptionList.ref, Callout.ref]),
    ),
    gap: z.enum(["tight", "normal", "loose"]).optional(),
  }),
  component: ({ props, renderNode }) => (
    <div
      className={cn("flex flex-col", GAP_CLASS[props.gap ?? "normal"])}
    >
      {renderNode(props.children)}
    </div>
  ),
});

const Card = defineComponent({
  name: "Card",
  description:
    "Top-level container for one structured assistant reply. Must be the root element. Stack its children top to bottom.",
  props: z.object({
    children: z.array(
      z.union([
        TextContent.ref,
        KeyValue.ref,
        OptionList.ref,
        Callout.ref,
        Stack.ref,
      ]),
    ),
  }),
  component: ({ props, renderNode }) => (
    <div className="flex flex-col gap-2 rounded-xl border border-border/50 bg-background/60 p-3">
      {renderNode(props.children)}
    </div>
  ),
});

/** Shared library used by the build-time prompt generator and client Renderer. */
export const chatOpenUILibrary = createLibrary({
  root: "Card",
  components: [TextContent, KeyValue, OptionList, Callout, Stack, Card],
  componentGroups: [
    {
      name: "Layout",
      components: ["Card", "Stack"],
      notes: [
        "- Every program MUST start with `root = Card([...])`.",
        "- Use Stack to group related KeyValue rows.",
      ],
    },
    {
      name: "Content",
      components: ["TextContent", "KeyValue", "OptionList", "Callout"],
      notes: [
        "- Use KeyValue for booking/course details, OptionList for choices.",
        "- Use Callout('...', 'success') to confirm a completed action.",
      ],
    },
  ],
});
