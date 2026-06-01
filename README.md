## MCP Research Prototype: Traditional UI vs Conversational AI (MCP)

**Experimental platform comparing traditional GUI workflows and MCP-enabled conversational interaction for university course registration and facility booking.**

This repository contains the prototype system and research artifact for the study:

**“Comparing Intent-Driven and Interface-Driven Interaction: An Empirical Study of Traditional UI and Conversational AI Using the Model Context Protocol (MCP)”**

The project implements **two interaction modalities** for the same task scenarios (course registration + facility booking), mirroring the experimental setup in the paper:

- **Traditional web UIs**: task completion via standard navigation, forms, and buttons
- **Conversational system**: a chat-based agent that interprets intent and executes actions via **Model Context Protocol (MCP)** tool invocation

Both modalities share the **same Supabase backend** (schema, business logic, and data), enabling controlled comparisons between **interface-driven** and **intent-driven** interaction.

## Research goals (from the paper)

The study investigates how MCP-enabled conversational systems compare with traditional graphical user interfaces in terms of:

- **Usability** (System Usability Scale, SUS)
- **Psychological experience** (Self-Determination Theory–based measures of autonomy, competence, and satisfaction)
- **Cognitive workload** (NASA Raw Task Load Index, NASA Raw-TLX)
- **User preference and trust** for task-oriented digital services

The main research contributions are:

1. **Empirical comparison** of MCP-based conversational interaction and traditional GUIs under controlled task scenarios.
2. **Prototype platform** that enables equivalent task execution through both interaction modalities on a shared backend.
3. **Human-centered design insights** into how conversational AI and traditional interfaces can coexist in hybrid interaction environments.

## Experimental tasks and systems

In the experiment, each participant used both systems (within-subject design) to complete four university-style digital service tasks:

- Register for a course
- Drop a course
- Book a facility room
- Cancel a facility booking

The two experimental systems are:

- **Traditional UI System**: web-based course registration and facility booking apps using standard navigation menus, forms, and buttons.
- **MCP Conversational System**: a Gemini-powered chat agent where users express intent in natural language and the agent executes actions via MCP tools.

Both systems share the same database and business logic so that any differences in the results come from the **interaction modality**, not the underlying functionality.

## System workflow diagram

![System workflow diagram](home/public/Project%20Plan.png)

This diagram summarizes how the prototype is wired:

- **Traditional UI path (left, blue)**: the two web apps (booking + registration) call backend APIs (REST/GraphQL) that read/write the shared database.
- **Conversational path (right, red)**: the chat agent interprets user intent, then uses **MCP** to invoke tools/actions that read/write the same database (via the MCP server).
- **Shared data + analytics (bottom)**: task time, progress logs, and survey responses are recorded for analysis so both modalities can be compared under the same task scenarios.

## What’s in this repo

- **`chat-agent/`**: Next.js chat UI + API route that talks to Gemini and (optionally) calls MCP tools
- **`uni-booking/`**: Next.js traditional UI for facility booking
- **`uni-registration/`**: Next.js traditional UI for course registration
- **`home/`**: Next.js landing / research UI (survey, analysis pages, etc.)
- **`mcp-server/`**: Bun-based MCP server exposing university tools at `http://localhost:4004/mcp`
- **`supabase/`**: local dev database (migrations, seeds, generated types) + edge function(s)

## Prerequisites

You’ll need these installed locally:

- **Docker** (required by Supabase local development)
- **Supabase CLI** (`supabase`)
- **GNU Make** (`make`)
- **Node.js** (for the Next.js apps)
- **pnpm** (this repo uses `pnpm` for installs and dev scripts)
- **Bun** (to run the MCP server; the `mcp-server` scripts use Bun)

## Quick start (recommended)

1. **Start local Supabase + reset/seed DB + generate types**

```bash
make setup
```

2. **Create environment files**

`make setup` will create env files for you (only if they don’t already exist):

- `chat-agent/.env.local`
- `uni-booking/.env.local`
- `uni-registration/.env.local`
- `home/.env.local`
- `mcp-server/.env`

Then fill in the values (details below).

3. **Run all apps/services**

```bash
make dev
```

## Local URLs & ports

### Apps/services

- **Chat agent**: `http://localhost:4000`
- **Facility booking UI**: `http://localhost:4001`
- **Course registration UI**: `http://localhost:4002`
- **Home / research UI**: `http://localhost:4003`
- **MCP server**: `http://localhost:4004/mcp`

### Supabase local dev

Ports are configured in [`supabase/config.toml`](supabase/config.toml):

- **Supabase API**: `http://127.0.0.1:23456`
- **Postgres**: `127.0.0.1:34567`
- **Supabase Studio**: `http://127.0.0.1:56789`

### Same-network device testing (phone/tablet)

`localhost` only works on the machine running the dev servers. To open the apps from another device on the same Wi‑Fi/LAN, use your machine’s LAN IP:

```bash
make ip
```

This prints the host’s IPv4 address (macOS: `ipconfig getifaddr en0` with fallbacks on `en1`/`en2`; Windows: active adapter via PowerShell). `make dev` prints the same value when services start.

Example URLs (replace with the printed IP):

- Chat agent: `http://<LAN_IP>:4000`
- Facility booking: `http://<LAN_IP>:4001`
- Course registration: `http://<LAN_IP>:4002`
- Home: `http://<LAN_IP>:4003`

You may need to allow incoming connections in the OS firewall. MCP and Supabase URLs in `.env.local` are still typically `localhost` unless you reconfigure them for LAN access.

## Environment variables

### Google Gemini API key (required for `chat-agent`)

The chat agent uses the Vercel AI SDK Google provider (`@ai-sdk/google`), which reads the API key from:

- `GOOGLE_GENERATIVE_AI_API_KEY`

Get a key from **Google AI Studio**, then set it in `chat-agent/.env.local`.

You can also override the model used in the UI/API route:

- `NEXT_PUBLIC_GOOGLE_GENERATIVE_MODEL_ID` (default: `gemini-2.5-flash`)

### Supabase (required for the Next.js apps)

Each Next.js app expects:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

For local development, you can obtain these from:

```bash
supabase status
```

Set them in each app’s `.env.local` (`chat-agent`, `home`, `uni-booking`, `uni-registration`).

### MCP mode (optional)

By default, the chat agent can run without MCP (direct tools). To enable MCP tool usage from `mcp-server`, set in `chat-agent/.env.local`:

- `USE_MCP=true`
- `MCP_SERVER_URL=http://localhost:4004/mcp`
- `MCP_AUTH_TOKEN=...` (optional; required if you enable auth on the MCP server)

### MCP server environment (`mcp-server/.env`)

The MCP server uses a **service role** Supabase client (server-to-server). Set:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PORT=4004` (optional; default is `4004`)
- `MCP_AUTH_TOKEN=...` (optional; if set, clients must send this token)

Important: **Never expose the service role key to the browser** and never commit secrets.

## Make commands (what they do)

This repo ships with a root [`Makefile`](Makefile) to make local dev repeatable.

- **`make setup`**: installs dependencies for all projects, starts Supabase locally, resets + seeds the DB, and regenerates TypeScript DB types (`supabase/types/database.types.ts`)
- **`make install`**: installs `pnpm` dependencies in each project
- **`make dev`**: runs all apps/services in parallel (Next.js apps + MCP server + Supabase edge functions); prints the LAN IP for same-network device testing
- **`make ip`**: prints this machine’s LAN IPv4 (`LOCAL_IP` in the Makefile; macOS + Windows compatible)
- **`make db-start`**: starts the local Supabase stack (Docker)
- **`make db-stop`**: stops the local Supabase stack
- **`make db-status`**: prints local Supabase URLs/keys
- **`make db-reset`**: runs `supabase db reset` (re-applies migrations + seeds)
- **`make db-gen`**: regenerates TypeScript types from the local DB
- **`make edge-functions`**: runs `supabase functions serve` (local edge functions)

## Troubleshooting

- **Docker not running**: `supabase start` / `make db-start` will fail. Start Docker Desktop first.
- **Missing local Supabase keys**: run `supabase status` and copy the local API URL + anon key into each app’s `.env.local`.
- **Gemini key issues**: ensure `GOOGLE_GENERATIVE_AI_API_KEY` is set in `chat-agent/.env.local`.
- **Ports already in use**: the apps run on ports `4000–4004` and Supabase uses `23456/34567/56789`. Stop conflicting processes or change ports in each app’s `package.json` scripts.

## Key findings (summary)

The full details, analysis, and figures are presented in the associated research paper. At a high level, the empirical results show that:

- **For the full participant sample (N = 142)**:
  - The **Traditional UI** achieved higher SUS scores (≈68.9) than the conversational **Chat-Agent** (≈62.7), and produced **lower cognitive workload** on NASA Raw-TLX.
  - Participants reported higher perceived **autonomy and competence** with the Traditional UI, and expressed **greater trust** in the graphical interface for unsupervised task execution.
- **For technically proficient participants (N = 18)**:
  - The pattern reverses for usability: the **Chat-Agent** achieved a higher SUS score (≈74.0) than the Traditional UI (≈62.9), and workload perceptions became more balanced.
  - Advanced users perceived conversational, intent-driven interaction as offering greater **control and efficiency**, but still reported **higher trust** in the traditional interface for autonomous operation.
- **Task-based preferences** across both groups favored a **hybrid model**:
  - Many participants preferred **chat for simple or well-defined tasks**, and **traditional UI for complex tasks** where transparency and step-by-step control are more important.

Overall, the study suggests that MCP-enabled conversational systems are most effective when they **complement** traditional interfaces rather than replace them, enabling hybrid interaction where users can express intent conversationally while still relying on graphical elements for visibility, confirmation, and fine-grained control.

## Contact

**Author**  
Kyaw Kyaw Oo  
Department of Mathematics and Computer Science, Chulalongkorn University (Bangkok, Thailand)  
Email: `kyawkyawjek@gmail.com`
