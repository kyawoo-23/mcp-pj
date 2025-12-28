# Track Plan: Core Chat Integration

## Phase 1: Environment & Backend Setup
- [x] Task: Configure environment variables for Google Gemini API key and Supabase credentials.
- [x] Task: Verify Supabase connection and ensure the `profiles` table is accessible.
- [x] Task: Create a Next.js API route `src/app/api/chat/route.ts` using the Vercel AI SDK.
- [x] Task: Implement server-side logic to fetch the current user's profile from Supabase within the API route.
- [x] Task: Construct the system prompt, injecting the fetched user profile data (Name, Department, Role).
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Environment & Backend Setup' (Protocol in workflow.md)

## Phase 2: Frontend Integration
- [x] Task: Install `ai` and `@ai-sdk/google` packages.
- [x] Task: Refactor `src/components/chat/chat-message-list.tsx` and `chat-input.tsx` to use the `useChat` hook from `ai/react`.
- [x] Task: Connect the chat UI components to the `/api/chat` endpoint.
- [x] Task: Implement streaming message display in `chat-message-list.tsx`.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Frontend Integration' (Protocol in workflow.md)

## Phase 3: Testing & Polish
- [ ] Task: Test the chat flow with different mock user profiles to ensure context is correctly injected.
- [ ] Task: Verify error handling (e.g., API failure, network issues) and display appropriate messages to the user.
- [ ] Task: Ensure the UI matches the design guidelines (Markdown rendering, responsiveness).
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Testing & Polish' (Protocol in workflow.md)
