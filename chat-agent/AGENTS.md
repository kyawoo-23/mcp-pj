# Project Rules

## Tech Stack & Tools
- **Package Manager**: Use `pnpm` for all package management commands.
- **UI Components**: Use `shadcn/ui` for UI components.
- **Forms**: Use `react-hook-form` combined with `zod` for validation.
- **Generative UI (optional)**: [`@openuidev/react-lang`](https://www.openui.com/) for render-only OpenUI Lang blocks in assistant replies. Gated by `NEXT_PUBLIC_OPENUI_RENDERING` (default off).

## UI/UX Guidelines
- **Consistency**: Ensure the UI is consistent across the entire `chat-agent` project. Follow existing patterns and styles.
- **OpenUI is optional**: With the feature flag off, assistant messages are Markdown-only. Do not assume OpenUI blocks are present in every reply.

## Database & Types
- **Type Definitions**: Always reference `database.types.ts` for database schema and type definitions. Ensure strict type safety matching the Supabase schema.

---

# OpenUI Lang (optional generative UI)

## Overview

OpenUI Lang lets the assistant emit **structured UI** (cards, detail rows, lists)
inside chat replies, alongside normal Markdown. This is a **render-only**
integration: the model outputs a fenced code block tagged `openui`; the client parses
and renders it with `@openuidev/react-lang`. Task mutations still go through
MCP tools (or the non-MCP fallback) — OpenUI does not replace tool execution.

**Default**: disabled (`NEXT_PUBLIC_OPENUI_RENDERING=false`). Enable only when
you explicitly want structured UI in assistant replies.

## Canonical documentation

**Primary reference**: https://www.openui.com/

For agent workflows, see also `.claude/skills/openui/SKILL.md` in the repo root.

## Key files

| Path | Role |
| ---- | ---- |
| `src/lib/openui/openui-config.ts` | Feature flag + fence lang constant |
| `src/lib/openui/chat-library.tsx` | Component library (`defineComponent` + renderers) |
| `src/lib/openui/extract-openui-block.ts` | Split Markdown vs fenced OpenUI (incl. streaming) |
| `src/lib/openui/openui-system-prompt.ts` | Loads generated prompt block |
| `scripts/generate-openui-prompt.mts` | Build-time prompt generator |
| `src/generated/openui-system-prompt.ts` | Generated prompt (do not hand-edit) |
| `src/components/chat/openui-aware-content.tsx` | Markdown + OpenUI segment renderer |
| `src/components/chat/openui-message.tsx` | OpenUI `Renderer` wrapper + fallbacks |

## Workflow for agents

1. **Changing components**: edit `chatOpenUILibrary` in `chat-library.tsx`, then run `pnpm generate:openui-prompt` (also runs automatically in `prebuild`).
2. **Changing prompt instructions**: edit options in `scripts/generate-openui-prompt.mts`, regenerate.
3. **Testing**: co-located tests in `src/lib/__tests__/extract-openui-block.test.ts` and `src/components/chat/__tests__/openui-message.test.tsx`.
4. **Research hygiene**: enabling OpenUI changes how the conversational modality presents information. Flag this when altering default env or system-prompt behavior for the study.

---

# Agent Rules for Model Context Protocol (MCP)

## Canonical Documentation Source

**Primary Reference**: https://modelcontextprotocol.io/

Treat https://modelcontextprotocol.io/ as the **only canonical source of truth** for anything related to the Model Context Protocol (MCP), including:

- MCP specification
- Core concepts and terminology
- Server and tool APIs
- Protocol flows and message formats
- Examples and best practices

**Reference Date**: 2025-11-25

The version of the documentation as of **2025-11-25** is the authoritative reference for this project.

## Handling Documentation Versions

### Newer Documentation Detection

If you detect or retrieve documentation that appears to be newer than 2025-11-25, you must:

1. **Explicitly mention** that it is newer than the reference date
2. **Still treat the 2025-11-25 version** as the authoritative reference for this project

### Version-Aware Responses

When answering questions or writing code about MCP:

1. **Always cross-check details** against https://modelcontextprotocol.io/:

   - Endpoints and API paths
   - Request/response schemas
   - Required vs. optional fields
   - Payload formats
   - Protocol flows and message sequences
   - Error handling patterns

2. **If unsure about any MCP detail**:

   - Re-check the canonical documentation
   - Prefer the behavior/specification that matches the 2025-11-25 state

3. **When citing or explaining behavior**, clarify:
   - Whether it is **directly from the 2025-11-25 docs**, or
   - An **inference/extension** beyond what is explicitly stated

## Code Generation and Examples

### MCP Implementation Patterns

When generating example MCP servers, tools, or clients (in any language):

1. **Base implementations** on patterns and recommendations from https://modelcontextprotocol.io/ as of 2025-11-25
2. **Follow established conventions** from the canonical documentation
3. **Use official schemas and types** as defined in the 2025-11-25 specification

### Post-Reference-Date Features

Avoid introducing features or patterns that only appear in later versions of the docs unless you:

1. **Clearly label them** as "post–2025-11-25 changes"
2. **Provide an equivalent or fallback** that is compatible with the 2025-11-25 version
3. **Document the compatibility implications** of using newer features

## Conflict Resolution

### Code vs. Documentation Conflicts

If project code/comments and the MCP documentation conflict, you must:

1. **Point out the discrepancy** explicitly
2. **Prefer the 2025-11-25 MCP documentation** as the correct behavior
3. **Only deviate** if the user explicitly instructs otherwise

### Resolution Process

When encountering conflicts:

1. Identify the specific conflict (what the code does vs. what the docs say)
2. Reference the relevant section of the canonical documentation
3. Propose corrections aligned with the 2025-11-25 specification
4. Seek user confirmation if the conflict appears intentional or project-specific

## Best Practices

- **Verify before implementing**: Always consult the canonical docs before writing MCP-related code
- **Document deviations**: If project requirements necessitate deviations, document them clearly
- **Version awareness**: Be explicit about which version of the spec you're following
- **Clarity over assumptions**: When uncertain, state assumptions and reference the documentation

---

**Last Updated**: 2025-11-25  
**Canonical Source**: https://modelcontextprotocol.io/
