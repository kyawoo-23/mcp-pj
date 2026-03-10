# MCP Architecture Setup

This document provides a detailed overview and diagrams of the Model Context Protocol (MCP) architecture setup in the `mcp-pj` experimental project.

## High-Level System Architecture

The overarching architecture is designed to compare traditional UI interactions with conversational (MCP-enabled) interactions. Both interaction pathways share the same underlying Supabase database to ensure a controlled experimental environment.

```mermaid
flowchart TD
%% Base Styling
classDef default fill:#f9f9f9,stroke:#333,stroke-width:1px,color:#333;
classDef nextjs fill:#000000,stroke:#666,stroke-width:2px,color:#fff,rx:4,ry:4;
classDef mcp fill:#ffeb3b,stroke:#fbc02d,stroke-width:2px,color:#000,rx:4,ry:4;
classDef db fill:#3ecf8e,stroke:#24b47e,stroke-width:2px,color:#fff,rx:4,ry:4;
classDef ai fill:#4285f4,stroke:#1a73e8,stroke-width:2px,color:#fff,rx:4,ry:4;
classDef user fill:#9c27b0,stroke:#7b1fa2,stroke-width:2px,color:#fff,rx:40,ry:40;

    %% Nodes
    USER(["User"]):::user

    subgraph ChatAgentModal ["Conversational Modality"]
        direction TB
        CHAT_UI["Chat-Agent App<br/>(Next.js on :4000)"]:::nextjs
        SDK["Vercel AI SDK<br/>+ Gemini API"]:::ai
        MCP_SERVER["MCP Server<br/>(Bun on :4004)"]:::mcp

        subgraph Tools ["Registered MCP Tools"]
            direction LR
            COURSE["Course:<br/>search, register, drop"]:::mcp
            FACILITY["Facility:<br/>book, search, cancel"]:::mcp
        end
        MCP_SERVER -.->|Exposes| Tools
    end

    subgraph TraditionalModal ["Traditional Modality"]
        TRAD_UI["Traditional UIs<br/>Booking :4001<br/>Registration :4002"]:::nextjs
    end

    subgraph SharedDataLayer ["Shared Backend"]
        direction TB
        SUPABASE[("Supabase DB<br/>PostgreSQL on :34567")]:::db
        API["Supabase Client API"]:::db
    end

    %% Connections
    USER -->|Natural Language Intent| CHAT_UI
    USER -->|Point & Click / Forms| TRAD_UI

    %% Conversational flow
    CHAT_UI -->|Prompts + Tool Config| SDK
    SDK -.->|Decision: Use Tool| CHAT_UI
    CHAT_UI -->|"HTTP POST /mcp<br/>(MCP Protocol over SSE)"| MCP_SERVER
    Tools -->|Execute via Service Key| SUPABASE

    %% Traditional flow
    TRAD_UI -->|REST/GraphQL| API
    API -->|Read/Write via Anon Key| SUPABASE
```

## MCP Interaction Sequence Diagram

When a user interacts with the `chat-agent`, the agent uses the Vercel AI SDK to communicate with the Google Gemini model. The model is made aware of the tools exposed by the `mcp-server` over HTTP transport.

```mermaid
sequenceDiagram
    autonumber
    actor User

    box lightpink Modality 2: Conversational AI
    participant CA as chat-agent (API Route)
    participant SDK as Vercel AI SDK
    end

    box lightyellow MCP Layer
    participant MCP as mcp-server (Port 4004)
    end

    box lightblue External Services
    participant Gemini as Google Gemini
    participant SB as Supabase (Database)
    end

    %% Initialization
    note over CA, MCP: Server Initialization
    CA->>MCP: Fetch available tools via HTTP Transport
    MCP-->>CA: Returns [Course Tools, Facility Tools]

    %% User Request
    User->>CA: "Book the tennis court for 5 PM tomorrow"

    %% AI Processing
    CA->>SDK: streamText() with User Prompt & System Prompt
    SDK->>Gemini: Send Conversation History + Available Tools
    Gemini-->>SDK: Model decides to call `search_facilities`
    SDK-->>CA: Intercept Tool Call: `search_facilities`

    %% Tool Invocation Flow
    CA->>+MCP: POST /mcp (handleRequest: `search_facilities`)
    MCP->>+SB: Query facility table (Service Role)
    SB-->>-MCP: Returns facility details (ID, Name, etc.)
    MCP-->>-CA: Tool Result (Facility ID)

    %% Follow-up AI Processing
    CA->>SDK: Provide Tool Result to Model
    SDK->>Gemini: Send Tool Result

    Gemini-->>SDK: Model decides to call `book_facility(facilityId, dateTime)`
    SDK-->>CA: Intercept Tool Call: `book_facility`

    CA->>+MCP: POST /mcp (handleRequest: `book_facility`)
    MCP->>+SB: Insert booking record (Service Role)
    SB-->>-MCP: Booking Confirmed
    MCP-->>-CA: Tool Result (Success)

    CA->>SDK: Provide Tool Result to Model
    SDK->>Gemini: Send final Tool Result
    Gemini-->>SDK: Generate natural language response
    SDK-->>CA: Stream text response

    %% Response
    CA-->>User: "I have successfully booked the Tennis Court for 5 PM tomorrow."
```

## Detailed System Component Breakdown

1. **`chat-agent` (Next.js App on Port 4000):**
   - Implements `POST /api/chat`.
   - Uses `@ai-sdk/mcp`'s `createMCPClient` using `http` transport to dynamically pull all tool capabilities from `mcp-server`.
   - Maintains a secure session and proxies the AI's tool execution requests explicitly to the `mcp-server`.
   - Injects user UUID into standard prompt configurations, enforcing that Gemini refers to users securely and logically invokes MCP tools.

2. **`mcp-server` (Bun HTTP Server on Port 4004):**
   - Built with Bun and `@modelcontextprotocol/sdk`.
   - Exposes tools grouped into logical endpoints (Courses, Facilities).
   - Validates requests via `MCP_AUTH_TOKEN`.
   - Directly executes database mutations utilizing the Supabase **Service Role Key** which enables backend security independently of the client APIs.

3. **Traditional UIs (Next.js Apps on Ports 4001, 4002):**
   - Represents the baseline for evaluating intent-driven conversational interfaces against traditional point-and-click or form-based interactions.
   - Connects to Supabase via standard client APIs.

4. **Supabase Integration (Port 34567):**
   - Instead of routing complex business logic throughout various backend wrappers, `mcp-server` hits Supabase Postgres tables directly.
   - Operations from conversational interfaces execute robustly under a simplified authorization context while preserving the shared source of truth.
   - Traditional UIs operate over standard Supabase client libraries (REST/GraphQL endpoints) with anonymous/user keys.
