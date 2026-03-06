# MCP Research Prototype: Traditional UI vs Conversational AI (MCP)

This repository contains the prototype system and research artifact for the study:

**“An Empirical Comparison of Traditional User Interface and Conversational Artificial Intelligence Using the Model Context Protocol”**

The project implements **two interaction modalities** for the same task scenarios (course registration + facility booking):

- **Traditional web UIs**: task completion via standard navigation, forms, and buttons
- **Conversational system**: a chat-based agent that interprets intent and executes actions via **Model Context Protocol (MCP)** tool invocation

Both modalities share the **same Supabase backend** (schema, business logic, and data), enabling controlled comparisons.

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
- **`make dev`**: runs all apps/services in parallel (Next.js apps + MCP server + Supabase edge functions)
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

## Research context (high level)

The study evaluates usability and workload differences between traditional GUI workflows and MCP-enabled conversational task execution. Tasks include:

- Register for a course
- Drop a course
- Book a facility room
- Cancel a facility booking

Measures used include **SUS**, **SDT-derived autonomy/competence**, and **NASA Raw-TLX**.

## About the author

**Kyaw Kyaw Oo**  
Department of Mathematics and Computer Science, Chulalongkorn University (Bangkok, Thailand)  
Email: `kyawkyawjek@gmail.com`

If you’re using this repo for academic or research purposes, please cite the paper title above (draft).
