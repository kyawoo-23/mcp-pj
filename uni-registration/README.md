This is the **Traditional UI (Course Registration)** app for the MCP research prototype  
**“Comparing Intent-Driven and Interface-Driven Interaction: An Empirical Study of Traditional UI and Conversational AI Using the Model Context Protocol (MCP)”**.

It implements the **interface-driven** course registration workflow used in the experiment, where participants:

- Register for a course
- Drop a course

The app uses standard GUI elements (navigation menus, forms, buttons) and shares the same Supabase backend as the conversational MCP-based chat agent.

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

By default this app runs at `http://localhost:4002` (see `package.json`).

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
