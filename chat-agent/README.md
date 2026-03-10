This is the **conversational (intent-driven)** part of the MCP research prototype  
**“Comparing Intent-Driven and Interface-Driven Interaction: An Empirical Study of Traditional UI and Conversational AI Using the Model Context Protocol (MCP)”**.

It provides a Next.js chat UI and API route that talk to **Google Gemini** and invoke university service tools via an **MCP server**, enabling users to perform the same tasks as the traditional UIs by expressing goals in natural language (e.g., “Book a study room tomorrow at 2 PM” or “Drop CS101 this semester”).

## Getting Started

### 1) Create `.env.local`

Copy the template:

```bash
cp .env.example .env.local
```

Then fill the variables below.

### 2) Run the dev server

From this folder:

```bash
pnpm dev
```

By default this app runs at `http://localhost:4000` (see `package.json`).

## Environment variables (`.env.example`)

- **`NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`**: Supabase client config used by the app (browser-safe anon key). For local values, run `supabase status` from the repo root.
- **`GOOGLE_GENERATIVE_AI_API_KEY`**: Gemini API key from Google AI Studio. The `@ai-sdk/google` provider reads this env var by default.
- **`NEXT_PUBLIC_GOOGLE_GENERATIVE_MODEL_ID`**: Optional model ID override (default in code is `gemini-2.5-flash`).
- **`USE_MCP`**: Feature flag for enabling MCP tool mode in the chat API route (`"true"` enables).
- **`MCP_SERVER_URL`**: MCP server endpoint (default: `http://localhost:4004/mcp`).
- **`MCP_AUTH_TOKEN`**: Optional auth token. If the MCP server sets `MCP_AUTH_TOKEN`, the chat agent must send the same token as a Bearer token.
- **`NEXT_PUBLIC_SITE_URL`**: Used for server-side URL construction in some utilities (safe to set for local).
- **`NEXT_PUBLIC_DEV_MODE`**: Used by some UI logic to prefer local URLs (e.g. survey links).

## System prompt (how the agent is instructed)

The chat API route builds a large **system prompt** in [`src/app/api/chat/route.ts`](src/app/api/chat/route.ts). In summary, it enforces:

- **Role & tone**: “Uni-Chat Agent”, warm and supportive.
- **Identity & privacy rules**: uses the student’s internal UUID for tool calls but **must not reveal it** to the user.
- **Tool usage policy**: when users ask about courses/facilities or want actions, it should use tools rather than guessing.
- **Error handling expectations**: special handling for known tool errors like `ALREADY_REGISTERED` and `TIME_SLOT_UNAVAILABLE`.
- **Critical workflow constraints**:
  - **Ask for explicit confirmation** before any data-changing action (booking/registering).
  - **Correct ID usage**: tools require UUIDs from previous tool results (never use course codes/section numbers as IDs).
  - **No auto-selection**: if multiple sections/options exist, it must ask the user to choose.
- **Conciseness**: be direct; don’t over-explain.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
