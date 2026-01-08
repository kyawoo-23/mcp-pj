# Track Specification: Core Chat Integration

## Overview
This track focuses on establishing the core conversational capability of the "Uni-Chat Agent". We will integrate the Vercel AI SDK with Google Gemini to power the chat interface. Crucially, we will connect this AI layer to the Supabase backend to securely authenticate users and retrieve their profile data (from the `profiles` table) to provide context-aware responses.

## Goals
1.  **AI Integration:** Successfully query Google Gemini using the Vercel AI SDK.
2.  **Streaming Response:** Implement real-time streaming of AI responses to the UI.
3.  **Context Injection:** Fetch user profile data from Supabase and inject it into the AI's system prompt.
4.  **UI Updates:** Update the existing chat UI to display real messages instead of mock data.

## Key Features
*   **Chat Interface:** A responsive chat window where students can type natural language queries.
*   **Profile Context:** The AI knows the student's name, department, and role (student/admin).
*   **Streaming Responses:** Smooth, typewriter-style output for AI answers.

## Technical Requirements
*   **Backend:** Next.js API route (`/api/chat`) to handle AI requests.
*   **Database:** Supabase Client for fetching `profiles` based on the authenticated user.
*   **Frontend:** `useChat` hook from `ai/react` to manage chat state.
*   **Security:** Ensure only authenticated users can access the chat API.

## Design Guidelines
*   Follow the **Product Guidelines** for tone (Academic Warmth) and formatting.
*   Use existing `shadcn/ui` components for consistency.
