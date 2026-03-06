# MCP Server (`mcp-server`)

This is the **Model Context Protocol (MCP) server** for the research prototype. It exposes “university services” tools (course registration + facility booking) over an MCP HTTP endpoint.

## Prerequisites

- **Bun**
- **Supabase project credentials** (URL + service role key)

## Getting started

### 1) Create `.env`

Copy the template:

```bash
cp .env.example .env
```

Then fill:

- **`SUPABASE_URL`**: your Supabase project URL
- **`SUPABASE_SERVICE_ROLE_KEY`**: service role key (server-only)
- **`PORT`**: defaults to `4004`
- **`MCP_AUTH_TOKEN`** (optional): if set, the server requires clients to send this token

Important: **never** put the service role key in any browser/client app and do not commit it.

### 2) Run in dev mode

```bash
bun install
bun run dev
```

The server will be available at:

- `http://localhost:4004/mcp`

Note: you can also run `pnpm dev` (it executes the same `package.json` script), but **Bun is still required** because the script uses `bun run`.

## Auth behavior

If `MCP_AUTH_TOKEN` is **not** set, the server runs with auth disabled (development mode).

If `MCP_AUTH_TOKEN` **is** set, clients must include:

- `Authorization: Bearer <token>`

## Used by `chat-agent`

The chat agent can call MCP tools when these are set in `chat-agent/.env.local`:

- `USE_MCP=true`
- `MCP_SERVER_URL=http://localhost:4004/mcp`
- `MCP_AUTH_TOKEN=<same token>` (only if the server requires it)

