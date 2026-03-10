This is the **Home / Research UI** for the MCP research prototype  
**“Comparing Intent-Driven and Interface-Driven Interaction: An Empirical Study of Traditional UI and Conversational AI Using the Model Context Protocol (MCP)”**.

It hosts the landing and research pages used in the experiment (pre-task demographics, post-task SUS / SDT / NASA Raw-TLX surveys, and comparative preference questions) and uses the shared Supabase backend for storing interaction logs and questionnaire responses.

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

By default this app runs at `http://localhost:4003` (see `package.json`).

## Environment variables (`.env.example`)

- **`NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`**: Supabase client config used by the app (browser-safe anon key). For local values, run `supabase status` from the repo root.
- **`NEXT_PUBLIC_SITE_URL`**: Used for server-side URL construction in some utilities (safe to set for local).
- **`NEXT_PUBLIC_DEV_MODE`**: Used by some UI logic to prefer local URLs (e.g. link to the local survey path).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
